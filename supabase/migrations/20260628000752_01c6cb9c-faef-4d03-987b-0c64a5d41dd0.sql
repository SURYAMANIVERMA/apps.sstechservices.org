
-- Lock down search_path + revoke public execute on internal helpers
ALTER FUNCTION public.gen_device_id() SET search_path = public;
ALTER FUNCTION public.gen_pin() SET search_path = public;
ALTER FUNCTION public.touch_updated_at() SET search_path = public;
ALTER FUNCTION public.is_student_email(text) SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.gen_device_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.gen_pin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_saved_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- rotate_my_pin is intentionally callable by authenticated users; ensure only that
REVOKE EXECUTE ON FUNCTION public.rotate_my_pin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rotate_my_pin() TO authenticated;
