/*
  Warnings:

  - The values [CERTIFICATE,OTHER] on the enum `EntryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."EntryType_new" AS ENUM ('PROJECT', 'INTERNSHIP', 'CERT');
ALTER TABLE "public"."Entry" ALTER COLUMN "type" TYPE "public"."EntryType_new" USING ("type"::text::"public"."EntryType_new");
ALTER TYPE "public"."EntryType" RENAME TO "EntryType_old";
ALTER TYPE "public"."EntryType_new" RENAME TO "EntryType";
DROP TYPE "public"."EntryType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Entry" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];
