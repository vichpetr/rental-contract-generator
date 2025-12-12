-- v7_unit_deposit.sql
-- Goal: Add 'deposit' field to rental_units table

alter table public.rental_units
add column deposit integer;

comment on column public.rental_units.deposit is 'Security deposit amount for the unit (Výše jistiny)';
