-- Migration v16: Add rent_due_day to rental_units

-- 1. Add columns
ALTER TABLE rental_units 
ADD COLUMN IF NOT EXISTS rent_due_day integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Refresh get_property_units (to ensure * picks up new columns if cached)
CREATE OR REPLACE FUNCTION public.get_property_units(target_property_id bigint)
RETURNS setof public.rental_units
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  select * from public.rental_units
  where property_id = target_property_id
  order by name;
$$;

-- 2. Update RPCs for Owner Management to include new field

-- UPDATE create_unit_as_owner
CREATE OR REPLACE FUNCTION create_unit_as_owner(
    p_property_id bigint,
    p_owner_id uuid,
    p_name text,
    p_description text,
    p_monthly_rent numeric,
    p_fee_per_person numeric,
    p_deposit numeric,
    p_max_occupants integer,
    p_area_m2 numeric,
    p_features text[],
    p_rent_due_day integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check ownership
    IF NOT EXISTS (
        SELECT 1 FROM properties 
        WHERE id = p_property_id 
        AND (owner_id = p_owner_id OR p_owner_id::text = current_setting('request.jwt.claim.sub', true))
    ) THEN
        RAISE EXCEPTION 'Access Denied: You do not own this property.';
    END IF;

    INSERT INTO rental_units (
        property_id, 
        name, 
        description, 
        monthly_rent, 
        fee_per_person, 
        deposit, 
        max_occupants, 
        area_m2, 
        features,
        rent_due_day
    ) VALUES (
        p_property_id, 
        p_name, 
        p_description, 
        p_monthly_rent, 
        p_fee_per_person, 
        p_deposit, 
        p_max_occupants, 
        p_area_m2, 
        p_features,
        p_rent_due_day
    );
END;
$$;

-- UPDATE update_unit_as_owner
CREATE OR REPLACE FUNCTION update_unit_as_owner(
    p_unit_id bigint,
    p_owner_id uuid,
    p_name text,
    p_description text,
    p_monthly_rent numeric,
    p_fee_per_person numeric,
    p_deposit numeric,
    p_max_occupants integer,
    p_area_m2 numeric,
    p_features text[],
    p_rent_due_day integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_property_id bigint;
BEGIN
    -- Get property_id
    SELECT property_id INTO v_property_id FROM rental_units WHERE id = p_unit_id;

    -- Check ownership
    IF NOT EXISTS (
        SELECT 1 FROM properties 
        WHERE id = v_property_id 
        AND (owner_id = p_owner_id OR p_owner_id::text = current_setting('request.jwt.claim.sub', true))
    ) THEN
        RAISE EXCEPTION 'Access Denied: You do not own this property.';
    END IF;

    UPDATE rental_units SET
        name = p_name,
        description = p_description,
        monthly_rent = p_monthly_rent,
        fee_per_person = p_fee_per_person,
        deposit = p_deposit,
        max_occupants = p_max_occupants,
        area_m2 = p_area_m2,
        features = p_features,
        rent_due_day = p_rent_due_day,
        updated_at = now()
    WHERE id = p_unit_id;
END;
$$;
