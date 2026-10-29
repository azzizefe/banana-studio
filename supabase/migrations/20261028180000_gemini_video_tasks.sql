-- Allow 'gemini' provider in provider_tasks table
ALTER TABLE public.provider_tasks DROP CONSTRAINT provider_tasks_provider_check;
ALTER TABLE public.provider_tasks ADD CONSTRAINT provider_tasks_provider_check
  CHECK (provider IN ('fal', 'evolink', 'openrouter', 'gemini'));
