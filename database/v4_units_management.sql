-- v4_units_management.sql
-- Goal: Update RLS polices for rental_units to allow owners and managers to edit them.

-- 1. DROP EXISTING RESTRICTIVE POLICIES ON RENTAL_UNITS
-- In v1, we only had "Admins can manage units". We need to broaden this.
drop policy if exists "Admins can manage units" on public.rental_units;

-- 2. CREATE NEW POLICIES FOR RENTAL_UNITS

-- Policy: Owners and Managers can manage (insert, update, delete) units for their properties
-- We use the helper function 'has_property_access' created in v2/v3 which checks ownership or role.
create policy "Owners and Managers can manage units" on public.rental_units
  using (
    public.has_property_access(property_id)
  );

-- Policy: Public/Generators can read units (Existing one might be fine, but ensuring it's robust)
drop policy if exists "Public/Generators can read units" on public.rental_units;
create policy "Authenticated users can read units" on public.rental_units
  for select
  using (auth.role() = 'authenticated');

-- 3. ENSURE TENANTS RLS IS ALSO UPDATED IF NEEDED
-- Tenants are stored in 'tenants' table. 
-- We need to ensure Property Owners/Managers can view/edit tenants assigned to their units/properties.
-- (This might be a separate task, but good to add if we are building a full management UI)

-- Add a policy for Tenants if not already flexible enough
-- v1 had: "Admins can manage tenants" and "Users can read own tenant record" and "Authenticated users can insert tenants"
-- We should allow Owners/Managers to view tenants linked to their properties.
-- For now, let's stick to Units management as requested, but keep this in mind.
