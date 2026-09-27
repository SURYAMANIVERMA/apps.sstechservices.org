
-- Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','support','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role);
$$;

CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- License keys
CREATE TABLE IF NOT EXISTS public.license_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  license_key TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'business',
  status TEXT NOT NULL DEFAULT 'active',
  seats INT NOT NULL DEFAULT 1,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  activated_device_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.license_keys TO authenticated;
GRANT ALL ON public.license_keys TO service_role;
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own licenses" ON public.license_keys FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "insert own license" ON public.license_keys FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());
CREATE POLICY "update own license" ON public.license_keys FOR UPDATE TO authenticated
USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "admin manage licenses" ON public.license_keys FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Support tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own tickets" ON public.support_tickets FOR SELECT TO authenticated
USING (owner_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'));
CREATE POLICY "create own ticket" ON public.support_tickets FOR INSERT TO authenticated
WITH CHECK (owner_id=auth.uid());
CREATE POLICY "update own ticket" ON public.support_tickets FOR UPDATE TO authenticated
USING (owner_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'))
WITH CHECK (owner_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'));

-- Ticket replies
CREATE TABLE IF NOT EXISTS public.ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_staff BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ticket_replies TO authenticated;
GRANT ALL ON public.ticket_replies TO service_role;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read replies for own tickets" ON public.ticket_replies FOR SELECT TO authenticated
USING (EXISTS(SELECT 1 FROM public.support_tickets t WHERE t.id=ticket_id AND (t.owner_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'))));
CREATE POLICY "reply on own ticket" ON public.ticket_replies FOR INSERT TO authenticated
WITH CHECK (author_id=auth.uid() AND EXISTS(SELECT 1 FROM public.support_tickets t WHERE t.id=ticket_id AND (t.owner_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'))));

-- License key generator
CREATE OR REPLACE FUNCTION public.gen_license_key()
RETURNS TEXT LANGUAGE plpgsql SET search_path=public AS $$
DECLARE
  alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  seg TEXT; part TEXT; result TEXT := ''; i INT; j INT;
BEGIN
  FOR i IN 1..4 LOOP
    part := '';
    FOR j IN 1..5 LOOP
      part := part || substr(alphabet, floor(random()*length(alphabet))::int+1, 1);
    END LOOP;
    IF i>1 THEN result := result || '-'; END IF;
    result := result || part;
  END LOOP;
  RETURN 'NX-' || result;
END $$;

-- Issue license RPC
CREATE OR REPLACE FUNCTION public.issue_license(_plan TEXT, _months INT, _seats INT DEFAULT 1)
RETURNS TABLE(license_key TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE new_key TEXT; exp TIMESTAMPTZ;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  new_key := public.gen_license_key();
  exp := CASE WHEN _months IS NULL OR _months=0 THEN NULL ELSE now() + (_months || ' months')::interval END;
  INSERT INTO public.license_keys(owner_id, license_key, plan, seats, expires_at)
  VALUES (auth.uid(), new_key, COALESCE(_plan,'business'), COALESCE(_seats,1), exp);
  license_key := new_key; expires_at := exp; RETURN NEXT;
END $$;

-- Touch triggers
DROP TRIGGER IF EXISTS trg_license_updated ON public.license_keys;
CREATE TRIGGER trg_license_updated BEFORE UPDATE ON public.license_keys
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_ticket_updated ON public.support_tickets;
CREATE TRIGGER trg_ticket_updated BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
