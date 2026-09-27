CREATE TABLE IF NOT EXISTS public.client_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL UNIQUE,
  current_pin text NOT NULL,
  alias text,
  platform text,
  app_version text,
  last_seen timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.client_devices TO service_role;

ALTER TABLE public.client_devices ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS client_devices_last_seen_idx ON public.client_devices(last_seen DESC);

DROP TRIGGER IF EXISTS client_devices_updated_at ON public.client_devices;
CREATE TRIGGER client_devices_updated_at
BEFORE UPDATE ON public.client_devices
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();