
-- Plan tiers
CREATE TYPE public.plan_tier AS ENUM ('free','student','monthly','quarterly','halfyearly','annual','two_year','three_year');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  plan plan_tier NOT NULL DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  is_student BOOLEAN NOT NULL DEFAULT false,
  student_institute TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid()=id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid()=id) WITH CHECK (auth.uid()=id);

-- Devices (one per user; persistent 9-digit ID + rotating PIN)
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL UNIQUE,
  pin TEXT NOT NULL,
  pin_rotated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  alias TEXT,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.devices TO authenticated;
GRANT ALL ON public.devices TO service_role;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own device read" ON public.devices FOR SELECT TO authenticated USING (auth.uid()=owner_id);
CREATE POLICY "own device update" ON public.devices FOR UPDATE TO authenticated USING (auth.uid()=owner_id) WITH CHECK (auth.uid()=owner_id);

-- Address book
CREATE TABLE public.saved_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_device_id TEXT NOT NULL,
  alias TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, partner_device_id)
);
CREATE INDEX saved_devices_owner_idx ON public.saved_devices(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_devices TO authenticated;
GRANT ALL ON public.saved_devices TO service_role;
ALTER TABLE public.saved_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved read" ON public.saved_devices FOR SELECT TO authenticated USING (auth.uid()=owner_id);
CREATE POLICY "own saved insert" ON public.saved_devices FOR INSERT TO authenticated WITH CHECK (auth.uid()=owner_id);
CREATE POLICY "own saved update" ON public.saved_devices FOR UPDATE TO authenticated USING (auth.uid()=owner_id) WITH CHECK (auth.uid()=owner_id);
CREATE POLICY "own saved delete" ON public.saved_devices FOR DELETE TO authenticated USING (auth.uid()=owner_id);

-- Sessions log
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_device_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
);
CREATE INDEX sessions_host_idx ON public.sessions(host_owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT ALL ON public.sessions TO service_role;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions read" ON public.sessions FOR SELECT TO authenticated USING (auth.uid()=host_owner_id);
CREATE POLICY "own sessions insert" ON public.sessions FOR INSERT TO authenticated WITH CHECK (auth.uid()=host_owner_id);

-- Helpers
CREATE OR REPLACE FUNCTION public.gen_device_id() RETURNS TEXT
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE candidate TEXT; tries INT := 0;
BEGIN
  LOOP
    candidate := lpad((floor(random()*900000000)+100000000)::bigint::text, 9, '0');
    candidate := substr(candidate,1,3)||'-'||substr(candidate,4,3)||'-'||substr(candidate,7,3);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.devices WHERE device_id = candidate);
    tries := tries + 1;
    IF tries > 10 THEN RAISE EXCEPTION 'Could not allocate device id'; END IF;
  END LOOP;
  RETURN candidate;
END $$;

CREATE OR REPLACE FUNCTION public.gen_pin() RETURNS TEXT
LANGUAGE sql SET search_path = public AS $$
  SELECT lpad((floor(random()*1000000))::int::text, 6, '0');
$$;

-- Detect student email domains
CREATE OR REPLACE FUNCTION public.is_student_email(email TEXT) RETURNS BOOLEAN
LANGUAGE sql IMMUTABLE AS $$
  SELECT lower(email) ~ '@([a-z0-9-]+\.)*(edu|ac\.in|edu\.in|edu\.[a-z]{2})$';
$$;

-- New user trigger: create profile + device, detect student
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE student_flag BOOLEAN; new_plan plan_tier; expires TIMESTAMPTZ;
BEGIN
  student_flag := public.is_student_email(NEW.email);
  IF student_flag THEN
    new_plan := 'student'; expires := now() + interval '1 year';
  ELSE
    new_plan := 'free'; expires := NULL;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, plan, plan_expires_at, is_student, student_institute)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    new_plan, expires, student_flag,
    CASE WHEN student_flag THEN split_part(NEW.email,'@',2) ELSE NULL END
  );

  INSERT INTO public.devices (owner_id, device_id, pin)
  VALUES (NEW.id, public.gen_device_id(), public.gen_pin());

  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Limit saved_devices: free=30, student=100, paid=unlimited
CREATE OR REPLACE FUNCTION public.enforce_saved_limit() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_count INT; limit_val INT; user_plan plan_tier;
BEGIN
  SELECT plan INTO user_plan FROM public.profiles WHERE id = NEW.owner_id;
  limit_val := CASE user_plan
    WHEN 'free' THEN 30
    WHEN 'student' THEN 100
    ELSE 100000 END;
  SELECT count(*) INTO current_count FROM public.saved_devices WHERE owner_id = NEW.owner_id;
  IF current_count >= limit_val THEN
    RAISE EXCEPTION 'Saved device limit reached (%). Upgrade your plan to add more.', limit_val
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER enforce_saved_limit_trg
BEFORE INSERT ON public.saved_devices
FOR EACH ROW EXECUTE FUNCTION public.enforce_saved_limit();

-- Rotate PIN function (called by client)
CREATE OR REPLACE FUNCTION public.rotate_my_pin() RETURNS TABLE(device_id TEXT, pin TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_pin TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  new_pin := public.gen_pin();
  UPDATE public.devices SET pin = new_pin, pin_rotated_at = now()
  WHERE owner_id = auth.uid()
  RETURNING devices.device_id, devices.pin INTO device_id, pin;
  RETURN NEXT;
END $$;

GRANT EXECUTE ON FUNCTION public.rotate_my_pin() TO authenticated;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
