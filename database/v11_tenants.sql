-- v11_tenants.sql
-- Goal: Add 'tenants' table for address book functionality

-- 0. Clean up (Force drop to ensure correct schema matches this script)
drop table if exists public.tenants cascade;
drop function if exists public.get_owner_tenants(uuid);
drop function if exists public.create_tenant_as_owner(uuid, text, text, text, text, text, text, text, text);
drop function if exists public.update_tenant_as_owner(bigint, uuid, text, text, text, text, text, text, text, text);
drop function if exists public.delete_tenant_as_owner(bigint, uuid);

-- 1. Create Table
create table public.tenants (
  id bigint generated always as identity primary key,
  owner_id uuid references auth.users(id) not null,
  first_name text not null,
  last_name text not null,
  birth_number text,
  address_street text,
  address_city text,
  address_zip text,
  email text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.tenants enable row level security;

-- 3. RLS Policies (Standard)
create policy "Owners can view their own tenants"
  on public.tenants for select
  using (auth.uid() = owner_id);

create policy "Owners can insert their own tenants"
  on public.tenants for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their own tenants"
  on public.tenants for update
  using (auth.uid() = owner_id);

create policy "Owners can delete their own tenants"
  on public.tenants for delete
  using (auth.uid() = owner_id);


-- 4. RPCs for Dev Mode Bypass (Explicit Admin/Dev Access)

-- Get Tenants
create or replace function public.get_owner_tenants(target_owner_id uuid)
returns setof public.tenants
language sql
security definer
stable
as $$
  select * from public.tenants
  where owner_id = target_owner_id
  order by last_name, first_name;
$$;

-- Create Tenant
create or replace function public.create_tenant_as_owner(
  p_owner_id uuid,
  p_first_name text,
  p_last_name text,
  p_birth_number text,
  p_address_street text,
  p_address_city text,
  p_address_zip text,
  p_email text,
  p_phone text
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.tenants (
    owner_id, first_name, last_name, birth_number, address_street, address_city, address_zip, email, phone
  ) values (
    p_owner_id, p_first_name, p_last_name, p_birth_number, p_address_street, p_address_city, p_address_zip, p_email, p_phone
  );
end;
$$;

-- Update Tenant
create or replace function public.update_tenant_as_owner(
  p_tenant_id bigint,
  p_owner_id uuid,
  p_first_name text,
  p_last_name text,
  p_birth_number text,
  p_address_street text,
  p_address_city text,
  p_address_zip text,
  p_email text,
  p_phone text
)
returns void
language plpgsql
security definer
as $$
begin
    -- Security check: ensure exists and belongs to owner
    if not exists (select 1 from public.tenants where id = p_tenant_id and owner_id = p_owner_id) then
        raise exception 'Tenant not found or permission denied';
    end if;

    update public.tenants
    set
        first_name = p_first_name,
        last_name = p_last_name,
        birth_number = p_birth_number,
        address_street = p_address_street,
        address_city = p_address_city,
        address_zip = p_address_zip,
        email = p_email,
        phone = p_phone,
        updated_at = now()
    where id = p_tenant_id;
end;
$$;

-- Delete Tenant
create or replace function public.delete_tenant_as_owner(
  p_tenant_id bigint,
  p_owner_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
    -- Security check
    if not exists (select 1 from public.tenants where id = p_tenant_id and owner_id = p_owner_id) then
        raise exception 'Tenant not found or permission denied';
    end if;

    delete from public.tenants
    where id = p_tenant_id;
end;
$$;

NOTIFY pgrst, 'reload schema';
