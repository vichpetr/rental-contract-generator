-- Phase 2.2: Dev Helper RPC

-- Function to get properties for a specific user ID (bypassing RLS)
create or replace function public.get_owner_properties(target_user_id uuid)
returns setof public.properties
language sql
security definer
stable
as $$
  select * from public.properties
  where owner_id = target_user_id
  order by name;
$$;

-- Function to get units for a specific property (bypassing RLS)
create or replace function public.get_property_units(target_property_id bigint)
returns setof public.rental_units
language sql
security definer
stable
as $$
  select * from public.rental_units
  where property_id = target_property_id
  order by name;
$$;

-- Function to UPDATE unit as owner (bypassing RLS)
create or replace function public.update_unit_as_owner(
  p_unit_id bigint,
  p_owner_id uuid,
  p_name text,
  p_description text,
  p_monthly_rent int,
  p_fee_per_person int,
  p_deposit int,
  p_max_occupants int,
  p_area_m2 numeric,
  p_features text[]
)
returns void
language plpgsql
security definer
as $$
begin
  -- Check permission: Unit must belong to a property owned by p_owner_id
  if not exists (
    select 1 
    from public.rental_units u
    join public.properties p on u.property_id = p.id
    where u.id = p_unit_id
    and p.owner_id = p_owner_id
  ) then
    raise exception 'Permission denied or unit not found';
  end if;

  update public.rental_units
  set
    name = p_name,
    description = p_description,
    monthly_rent = p_monthly_rent,
    fee_per_person = p_fee_per_person,
    deposit = p_deposit,
    max_occupants = p_max_occupants,
    area_m2 = p_area_m2,
    features = p_features
  where id = p_unit_id;
end;
$$;

-- Function to CREATE unit as owner (bypassing RLS)
create or replace function public.create_unit_as_owner(
  p_property_id bigint,
  p_owner_id uuid,
  p_name text,
  p_description text,
  p_monthly_rent int,
  p_fee_per_person int,
  p_deposit int,
  p_max_occupants int,
  p_area_m2 numeric,
  p_features text[]
)
returns void
language plpgsql
security definer
as $$
begin
  -- Check permission: Property must be owned by p_owner_id
  if not exists (
    select 1 
    from public.properties p 
    where p.id = p_property_id
    and p.owner_id = p_owner_id
  ) then
    raise exception 'Permission denied (property not owned by user)';
  end if;

  insert into public.rental_units (
    property_id, name, description, monthly_rent, fee_per_person, deposit, max_occupants, area_m2, features
  ) values (
    p_property_id, p_name, p_description, p_monthly_rent, p_fee_per_person, p_deposit, p_max_occupants, p_area_m2, p_features
  );
end;
$$;
