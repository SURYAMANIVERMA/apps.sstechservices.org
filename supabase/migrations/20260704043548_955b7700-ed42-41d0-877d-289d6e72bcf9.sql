CREATE POLICY "Trusted backend manages client devices"
ON public.client_devices
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);