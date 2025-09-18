/*
  Warnings:

  - The values [ARCHIVED] on the enum `EntryStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACHIEVEMENT] on the enum `EntryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."AssetKind" AS ENUM ('IMAGE', 'PDF');

-- CreateEnum
CREATE TYPE "public"."VerificationStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."FlagStatus" AS ENUM ('OPEN', 'RESOLVED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."EntryStatus_new" AS ENUM ('DRAFT', 'PUBLISHED');
ALTER TABLE "public"."Entry" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Entry" ALTER COLUMN "status" TYPE "public"."EntryStatus_new" USING ("status"::text::"public"."EntryStatus_new");
ALTER TYPE "public"."EntryStatus" RENAME TO "EntryStatus_old";
ALTER TYPE "public"."EntryStatus_new" RENAME TO "EntryStatus";
DROP TYPE "public"."EntryStatus_old";
ALTER TABLE "public"."Entry" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."EntryType_new" AS ENUM ('INTERNSHIP', 'PROJECT', 'CERTIFICATE', 'OTHER');
ALTER TABLE "public"."Entry" ALTER COLUMN "type" TYPE "public"."EntryType_new" USING ("type"::text::"public"."EntryType_new");
ALTER TYPE "public"."EntryType" RENAME TO "EntryType_old";
ALTER TYPE "public"."EntryType_new" RENAME TO "EntryType";
DROP TYPE "public"."EntryType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'VERIFIER';

-- CreateTable
CREATE TABLE "public"."Asset" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "kind" "public"."AssetKind" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Verification" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "verifierId" TEXT NOT NULL,
    "status" "public"."VerificationStatus" NOT NULL DEFAULT 'REQUESTED',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MetricDaily" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "entryViewsJson" JSONB,

    CONSTRAINT "MetricDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Flag" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "status" "public"."FlagStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flag_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."Entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Verification" ADD CONSTRAINT "Verification_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."Entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Verification" ADD CONSTRAINT "Verification_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MetricDaily" ADD CONSTRAINT "MetricDaily_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Flag" ADD CONSTRAINT "Flag_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."Entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Flag" ADD CONSTRAINT "Flag_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
