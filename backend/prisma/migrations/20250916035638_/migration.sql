-- 1️⃣ Create enums if not exist
DO $$ BEGIN
    CREATE TYPE "EntryType" AS ENUM ('PROJECT', 'INTERNSHIP', 'CERT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EntryStatus" AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2️⃣ Only clean up data if column is TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Entry'
          AND column_name = 'type'
          AND udt_name = 'text'
    ) THEN
        EXECUTE 'UPDATE "Entry" SET "type" = UPPER("type"::text);';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Entry'
          AND column_name = 'status'
          AND udt_name = 'text'
    ) THEN
        EXECUTE 'UPDATE "Entry" SET "status" = UPPER("status"::text);';
    END IF;
END$$;

-- 3️⃣ Relax constraints
ALTER TABLE "Entry"
    ALTER COLUMN "description" DROP NOT NULL,
    ALTER COLUMN "startDate" DROP NOT NULL,
    ALTER COLUMN "tags" DROP DEFAULT,
    ALTER COLUMN "status" DROP DEFAULT;

-- 4️⃣ Convert type/status if still TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Entry'
          AND column_name = 'type'
          AND udt_name = 'text'
    ) THEN
        ALTER TABLE "Entry"
            ALTER COLUMN "type" TYPE "EntryType"
            USING ("type"::text::"EntryType");
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Entry'
          AND column_name = 'status'
          AND udt_name = 'text'
    ) THEN
        ALTER TABLE "Entry"
            ALTER COLUMN "status" TYPE "EntryStatus"
            USING ("status"::text::"EntryStatus");
    END IF;
END$$;
