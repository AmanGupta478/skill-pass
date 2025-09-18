/*
  Warnings:

  - The values [REQUESTED] on the enum `VerificationStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `entryTitle` to the `Verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `Verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submittedDate` to the `Verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Verification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."VerificationStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."Verification" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Verification" ALTER COLUMN "status" TYPE "public"."VerificationStatus_new" USING ("status"::text::"public"."VerificationStatus_new");
ALTER TYPE "public"."VerificationStatus" RENAME TO "VerificationStatus_old";
ALTER TYPE "public"."VerificationStatus_new" RENAME TO "VerificationStatus";
DROP TYPE "public"."VerificationStatus_old";
ALTER TABLE "public"."Verification" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Verification" ADD COLUMN     "entryTitle" TEXT NOT NULL,
ADD COLUMN     "studentId" TEXT NOT NULL,
ADD COLUMN     "submittedDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "public"."Verification" ADD CONSTRAINT "Verification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
