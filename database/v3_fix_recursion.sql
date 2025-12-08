-- v3_fix_recursion.sql
-- Goal: Fix infinite recursion between properties and property_roles RLS policies.

-- 1. Create a helper function to check ownership securely (Bypass RLS)
-- This function accesses the properties table WITHOUT triggering its RLS policies
-- because it runs with the privileges of the function creator (SECURITY DEFINER).
create or replace function public.is_property_owner(check_property_id bigint, check_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return exists (
    select 1 
    from public.properties 
    where id = check_property_id 
    and owner_id = check_user_id
  );
end;
$$;

-- 2. Drop the problematic recursive policy
drop policy if exists "Owners can manage property roles" on public.property_roles;

-- 3. Re-create the policy using the new secure function
create policy "Owners can manage property roles" on public.property_roles
  using (
    public.is_property_owner(property_id, auth.uid())
  );

-- Note: The policies on 'properties' table can remain as they are, 
-- because they query 'property_roles' (which is fine), and now 'property_roles'
-- queries 'properties' via the SECURITY DEFINER function (breaking the RLS loop).
