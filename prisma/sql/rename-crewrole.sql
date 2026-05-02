-- Idempotent rename of the CrewRole Postgres enum values.
--
-- This must run BEFORE `prisma db push` because Postgres cannot cast
-- existing 'FO' / 'CABIN' rows to a renamed enum type during the
-- automatic schema sync. ALTER TYPE ... RENAME VALUE renames in place,
-- preserving all referencing rows.
--
-- The DO block guards each rename with an EXISTS check so this is safe
-- to run on every deploy: a no-op once 'FO' / 'CABIN' have been renamed.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'FO'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'CrewRole')
  ) THEN
    ALTER TYPE "CrewRole" RENAME VALUE 'FO' TO 'SIC';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'CABIN'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'CrewRole')
  ) THEN
    ALTER TYPE "CrewRole" RENAME VALUE 'CABIN' TO 'FA';
  END IF;
END
$$;
