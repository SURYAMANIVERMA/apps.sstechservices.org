-- Fix: prevent users from self-upgrading plan/student status via PATCH on profiles
-- Drop existing broad update policy and replace with column-restricted one

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND cmd='UPDATE'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- Users may update only safe profile fields (name, etc.) — never plan/billing fields
CREATE POLICY "Users update own profile safe fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND plan IS NOT DISTINCT FROM (SELECT plan FROM public.profiles WHERE id = auth.uid())
  AND plan_expires_at IS NOT DISTINCT FROM (SELECT plan_expires_at FROM public.profiles WHERE id = auth.uid())
  AND is_student IS NOT DISTINCT FROM (SELECT is_student FROM public.profiles WHERE id = auth.uid())
  AND student_institute IS NOT DISTINCT FROM (SELECT student_institute FROM public.profiles WHERE id = auth.uid())
);

-- Service role retains full control for backend plan upgrades after verified payment
CREATE POLICY "Service role manages plan fields"
ON public.profiles
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);