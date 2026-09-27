
CREATE TABLE public.admin_access_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  outcome TEXT NOT NULL CHECK (outcome IN ('granted','denied','error','unauthenticated')),
  reason TEXT,
  path TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX admin_access_audit_user_id_idx ON public.admin_access_audit (user_id, created_at DESC);
CREATE INDEX admin_access_audit_created_at_idx ON public.admin_access_audit (created_at DESC);

GRANT SELECT ON public.admin_access_audit TO authenticated;
GRANT ALL ON public.admin_access_audit TO service_role;

ALTER TABLE public.admin_access_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON public.admin_access_audit
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
