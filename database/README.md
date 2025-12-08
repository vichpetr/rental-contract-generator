# Database Schema

This directory contains the database schema and seed scripts for the Rental Contract Generator, managed via Supabase.

## Files

- `v1_properties_contracts.sql`: Defines properties, rental units, tenants, and contracts tables.
- `v2_schema_update.sql`: Updates schema with `shared_area_m2`, `equipment` and `property_roles` for sharing.
- `v3_seed_from_config.sql`: Seeds the database with the initial configuration from the application.

## Usage

These scripts should be run in Supabase SQL Editor to set up the database structure for the contract generator application.
