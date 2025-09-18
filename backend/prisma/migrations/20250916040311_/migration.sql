/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `Entry` table. All the data in the column will be lost.
  - You are about to drop the column `links` on the `Entry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Entry" DROP COLUMN "isDeleted",
DROP COLUMN "links";
