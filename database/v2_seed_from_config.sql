-- v3_seed_from_config.sql
-- Goal: Migrate data from contractConfig.js to the database (Schema V3).

-- 1. Insert Property (Household)
-- Using subquery to find owner ID by email (replace with your actual email if different)
with property_owner as (
  select id from auth.users where email = 'vichpetr@gmail.com' limit 1
),
inserted_property as (
  insert into public.properties (
    name, 
    address, 
    landlord_info, 
    settings, 
    owner_id,
    shared_area_m2,
    equipment
  )
  select 
    'Byt - Pronajímaná ulice 456', -- Name derived from address
    '{
      "street": "Pronajímaná ulice 456",
      "city": "Praha 2",
      "postalCode": "120 00",
      "specificLocation": "2. patro, vchod B"
    }'::jsonb,
    '{
      "name": "Jméno Příjmení",
      "birthNumber": "123456/7890",
      "address": {
        "street": "Ulice 123",
        "city": "Praha 1",
        "postalCode": "110 00"
      },
      "contact": {
        "phone": "+420 123 456 789",
        "email": "pronajimatel@email.cz"
      },
      "bankAccount": {
        "accountNumber": "1234567890",
        "bankCode": "0100"
      }
    }'::jsonb,
    '{
      "rentDueDay": 10,
      "noticePeriodMonths": 2,
      "defaultContractDuration": 2,
      "securityDeposit": {
        "amount": 20000,
        "currency": "Kč"
      },
      "servicesBreakdown": {
        "gas": 800,
        "electricity": 800,
        "coldWater": 500,
        "buildingServices": 600
      }
    }'::jsonb,
    property_owner.id,
    30, -- Estimate for shared area m2 (Hall, Kitchen, Bath etc.)
    ARRAY['kuchyňská linka', 'sporák', 'lednice', 'pračka', 'jídelní stůl'] -- inferred shared equipment
  from property_owner
  returning id, owner_id
),

-- 2. Insert Property Roles (Assign "Landlord" role to the owner explicitly as well, or just rely on owner_id)
-- Let's add a "landlord" role for the owner to demonstrate the feature.
inserted_roles as (
  insert into public.property_roles (property_id, user_id, role)
  select 
    inserted_property.id,
    inserted_property.owner_id,
    'landlord'
  from inserted_property
)

-- 3. Insert Rental Units (Variants)
insert into public.rental_units (
  property_id, 
  name, 
  description, 
  monthly_rent, 
  fee_per_person, 
  max_occupants, 
  area_m2, 
  features, 
  meter_readings
)
select 
  inserted_property.id,
  'Malý pokoj',
  'Pokoj pro jednu osobu',
  8000,
  2000,
  1,
  12,
  ARRAY['postel', 'stůl', 'židle', 'skříň'],
  '{
    "electricity": {"meterNumber": "EL123456", "unit": "kWh"},
    "water": {
        "cold": {"meterNumber": "V-STU123", "unit": "m³"},
        "hot": {"meterNumber": "V-TEP456", "unit": "m³"}
    },
    "gas": {"meterNumber": "PL789012", "unit": "m³"}
  }'::jsonb
from inserted_property

union all

select 
  inserted_property.id,
  'Velký pokoj',
  'Pokoj pro jednu až dvě osoby',
  12000,
  2500,
  2,
  20,
  ARRAY['2× postel', '2× stůl', '2× židle', 'vestavěné skříně'],
  '{
    "electricity": {"meterNumber": "EL123456", "unit": "kWh"},
    "water": {
        "cold": {"meterNumber": "V-STU123", "unit": "m³"},
        "hot": {"meterNumber": "V-TEP456", "unit": "m³"}
    },
    "gas": {"meterNumber": "PL789012", "unit": "m³"}
  }'::jsonb
from inserted_property;
