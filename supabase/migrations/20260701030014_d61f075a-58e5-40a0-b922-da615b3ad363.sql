CREATE OR REPLACE FUNCTION public.rotate_my_pin()
 RETURNS TABLE(device_id text, pin text)
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
DECLARE new_pin TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  new_pin := public.gen_pin();
  UPDATE public.devices SET pin = new_pin, pin_rotated_at = now()
  WHERE owner_id = auth.uid()
  RETURNING devices.device_id, devices.pin INTO device_id, pin;
  RETURN NEXT;
END $function$;