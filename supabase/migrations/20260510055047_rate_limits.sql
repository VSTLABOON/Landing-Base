-- Migration: Create rate_limits table

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,  -- IP address or user_id
  endpoint TEXT NOT NULL,
  request_count INT DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now()
);

-- Compound unique constraint to easily perform UPSERT (ON CONFLICT)
ALTER TABLE public.rate_limits DROP CONSTRAINT IF EXISTS rate_limits_identifier_endpoint_key;
ALTER TABLE public.rate_limits ADD CONSTRAINT rate_limits_identifier_endpoint_key UNIQUE (identifier, endpoint);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Policies
-- Drop existing ones just in case
DROP POLICY IF EXISTS "Service role has full access to rate_limits" ON public.rate_limits;

-- Only service_role can interact with rate_limits (Edge Functions)
CREATE POLICY "Service role has full access to rate_limits" 
ON public.rate_limits 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
