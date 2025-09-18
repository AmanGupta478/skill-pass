/*
  Warnings:

  - Changed the type of `type` on the `Verification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Verification" DROP CONSTRAINT "Verification_entryId_fkey";

-- AlterTable
ALTER TABLE "public"."Verification" DROP COLUMN "type",
ADD COLUMN     "type" "public"."EntryType" NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Verification" ADD CONSTRAINT "Verification_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
