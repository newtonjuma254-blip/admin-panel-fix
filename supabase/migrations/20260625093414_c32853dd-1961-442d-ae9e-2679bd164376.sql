ALTER FUNCTION public.has_role(text) SECURITY INVOKER;
ALTER FUNCTION public.has_role(uuid, text) SECURITY INVOKER;

NOTIFY pgrst, 'reload schema';