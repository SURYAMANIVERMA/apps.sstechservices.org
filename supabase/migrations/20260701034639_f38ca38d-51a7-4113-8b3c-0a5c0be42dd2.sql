
REVOKE ALL ON FUNCTION public.gen_license_key() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.issue_license(text,int,int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_license(text,int,int) TO authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
