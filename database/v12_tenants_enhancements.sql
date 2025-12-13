-- Add new columns to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS id_card_front_url text,
ADD COLUMN IF NOT EXISTS id_card_back_url text;

-- Storage Setup for ID Cards
-- Note: Supabase Storage schemas can be tricky in pure SQL migrations if the extension isn't fully managed here, 
-- but we can insert into storage.buckets and storage.objects/policies.
-- Usually, we assume 'storage' schema exists.

INSERT INTO storage.buckets (id, name, public)
VALUES ('id_cards', 'id_cards', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage (allow authenticated users to do everything for now for simplicity in this MVP context, 
-- ideally scoped to folder=user_id, but here filenames will likely contain random tokens or user_id prefix)
-- We will restrict it slightly more: Users can create/select/delete objects in 'id_cards' bucket.
CREATE POLICY "Users can manage their own id cards" ON storage.objects
FOR ALL USING (
  bucket_id = 'id_cards' AND auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'id_cards' AND auth.role() = 'authenticated'
);


-- Update RPC: create_tenant_as_owner
-- We need to drop first to change signature cleanly or just replace if we are sure
DROP FUNCTION IF EXISTS public.create_tenant_as_owner;

CREATE OR REPLACE FUNCTION public.create_tenant_as_owner(
  tenant_data jsonb
)
RETURNS public.tenants
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_tenant public.tenants;
  target_owner_id uuid;
BEGIN
  -- Extract owner_id from json or context. 
  -- For dev bypass, we expect owner_id in the json data.
  target_owner_id := (tenant_data->>'owner_id')::uuid;

  INSERT INTO public.tenants (
    owner_id,
    first_name,
    last_name,
    birth_number,
    address_street,
    address_city,
    address_zip,
    email,
    phone,
    date_of_birth,
    id_card_front_url,
    id_card_back_url
  )
  VALUES (
    target_owner_id,
    tenant_data->>'first_name',
    tenant_data->>'last_name',
    tenant_data->>'birth_number',
    tenant_data->>'address_street',
    tenant_data->>'address_city',
    tenant_data->>'address_zip',
    tenant_data->>'email',
    tenant_data->>'phone',
    (tenant_data->>'date_of_birth')::date,
    tenant_data->>'id_card_front_url',
    tenant_data->>'id_card_back_url'
  )
  RETURNING * INTO new_tenant;

  RETURN new_tenant;
END;
$$;

-- Update RPC: update_tenant_as_owner
DROP FUNCTION IF EXISTS public.update_tenant_as_owner;

CREATE OR REPLACE FUNCTION public.update_tenant_as_owner(
  tenant_id bigint,
  tenant_data jsonb
)
RETURNS public.tenants
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_tenant public.tenants;
BEGIN
  UPDATE public.tenants
  SET
    first_name = COALESCE(tenant_data->>'first_name', first_name),
    last_name = COALESCE(tenant_data->>'last_name', last_name),
    birth_number = COALESCE(tenant_data->>'birth_number', birth_number),
    address_street = COALESCE(tenant_data->>'address_street', address_street),
    address_city = COALESCE(tenant_data->>'address_city', address_city),
    address_zip = COALESCE(tenant_data->>'address_zip', address_zip),
    email = COALESCE(tenant_data->>'email', email),
    phone = COALESCE(tenant_data->>'phone', phone),
    date_of_birth = CASE WHEN tenant_data ? 'date_of_birth' THEN (tenant_data->>'date_of_birth')::date ELSE date_of_birth END,
    id_card_front_url = COALESCE(tenant_data->>'id_card_front_url', id_card_front_url),
    id_card_back_url = COALESCE(tenant_data->>'id_card_back_url', id_card_back_url),
    updated_at = now()
  WHERE id = tenant_id
  RETURNING * INTO updated_tenant;

  RETURN updated_tenant;
END;
$$;

-- RPC: get_tenant_detail (Optional, mostly for dev bypass if regular select fails)
CREATE OR REPLACE FUNCTION public.get_tenant_detail(
  target_id bigint
)
RETURNS public.tenants
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM public.tenants WHERE id = target_id;
$$;
