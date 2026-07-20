-- Run once in the Supabase SQL Editor before `prisma migrate deploy`.
-- Existing Smart Ekin migrations and raw SQL use unqualified PostGIS names,
-- so PostGIS must be installed in public for a fresh production database.

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;

DO $$
DECLARE
  postgis_schema text;
BEGIN
  SELECT namespace.nspname
  INTO postgis_schema
  FROM pg_extension extension
  JOIN pg_namespace namespace ON namespace.oid = extension.extnamespace
  WHERE extension.extname = 'postgis';

  IF postgis_schema IS DISTINCT FROM 'public' THEN
    RAISE EXCEPTION
      'PostGIS is installed in schema %, but Smart Ekin expects public. On a new project, disable PostGIS and run this script again before creating application tables.',
      postgis_schema;
  END IF;
END
$$;

SELECT PostGIS_Full_Version();
