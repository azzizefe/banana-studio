-- Validate the constraint in a separate transaction to avoid blocking concurrent writes
ALTER TABLE public.provider_tasks VALIDATE CONSTRAINT provider_tasks_provider_check;

