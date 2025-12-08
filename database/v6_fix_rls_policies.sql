-- Fix RLS policies to allow users to manage their OWN properties and units.
-- Previously only 'Admins' could do this.

-- 1. PROPERTIES
-- Allow owners to view their own properties
create policy "Owners can view own properties" on public.properties
    for select using (owner_id = auth.uid());

-- Allow owners to insert their own properties
create policy "Owners can insert own properties" on public.properties
    for insert with check (owner_id = auth.uid());

-- Allow owners to update their own properties
create policy "Owners can update own properties" on public.properties
    for update using (owner_id = auth.uid());

-- Allow owners to delete their own properties
create policy "Owners can delete own properties" on public.properties
    for delete using (owner_id = auth.uid());


-- 2. RENTAL UNITS
-- Allow owners to insert units into their own properties
create policy "Owners can insert units" on public.rental_units
    for insert with check (
        exists (
            select 1 from public.properties
            where id = rental_units.property_id
            and owner_id = auth.uid()
        )
    );

-- Allow owners to update units of their own properties
create policy "Owners can update units" on public.rental_units
    for update using (
        exists (
            select 1 from public.properties
            where id = rental_units.property_id
            and owner_id = auth.uid()
        )
    );

-- Allow owners to delete units of their own properties
create policy "Owners can delete units" on public.rental_units
    for delete using (
        exists (
            select 1 from public.properties
            where id = rental_units.property_id
            and owner_id = auth.uid()
        )
    );
