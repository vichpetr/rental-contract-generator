-- Phase 2.1: Enforce Property-Based Access Control

-- 1. Updates to PROPERTIES RLS
-- Existing policy: "Admins can manage properties" (using public.is_admin())
-- New requirement: Users (Owners) can view/manage their OWN properties.

drop policy if exists "Owners can view own properties" on public.properties;
create policy "Owners can view own properties"
  on public.properties
  for select
  using ( auth.uid() = owner_id );

drop policy if exists "Owners can update own properties" on public.properties;
create policy "Owners can update own properties"
  on public.properties
  for update
  using ( auth.uid() = owner_id );

-- (Insert/Delete might still be Admin only, or allow owners? Assuming Admin creates Property for Owner for now, or Owner creates it.)
-- If Owner creates property:
-- create policy "Owners can insert properties" on public.properties for insert with check (auth.uid() = owner_id);


-- 2. Updates to RENTAL UNITS RLS
-- Existing policy: "Public/Generators can read units" (using true) -> TOO PERMISSIVE
-- New requirement: Only owner of the parent property can see the units.

-- Drop the permissive policy
drop policy if exists "Public/Generators can read units" on public.rental_units;

-- Add strict policy
create policy "Owners can view units of their properties"
  on public.rental_units
  for select
  using (
    exists (
      select 1 from public.properties
      where public.properties.id = public.rental_units.property_id
      and public.properties.owner_id = auth.uid()
    )
    or public.is_admin() -- Keep admin access
  );

create policy "Owners can manage units of their properties"
  on public.rental_units
  for all
  using (
    exists (
      select 1 from public.properties
      where public.properties.id = public.rental_units.property_id
      and public.properties.owner_id = auth.uid()
    )
    or public.is_admin()
  );
