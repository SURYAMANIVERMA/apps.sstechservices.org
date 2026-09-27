
-- 1. license_keys: remove overly permissive user insert/update
DROP POLICY IF EXISTS "insert own license" ON public.license_keys;
DROP POLICY IF EXISTS "update own license" ON public.license_keys;

CREATE POLICY "insert trial license" ON public.license_keys
FOR INSERT TO authenticated
WITH CHECK (
  owner_id = auth.uid()
  AND plan = 'trial'
  AND status IN ('trial','active')
  AND seats <= 1
  AND (expires_at IS NULL OR expires_at <= now() + interval '30 days')
);

-- 2. ticket_replies: prevent is_staff escalation
DROP POLICY IF EXISTS "reply on own ticket" ON public.ticket_replies;
CREATE POLICY "reply on own ticket" ON public.ticket_replies
FOR INSERT TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND (
    is_staff = false
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'support'::app_role)
  )
  AND EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = ticket_replies.ticket_id
      AND (
        t.owner_id = auth.uid()
        OR public.has_role(auth.uid(), 'admin'::app_role)
        OR public.has_role(auth.uid(), 'support'::app_role)
      )
  )
);

-- 3. devices: add owner-scoped INSERT policy
CREATE POLICY "insert own device" ON public.devices
FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

-- 4. Revoke EXECUTE on SECURITY DEFINER helpers that should not be user-callable
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_saved_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
