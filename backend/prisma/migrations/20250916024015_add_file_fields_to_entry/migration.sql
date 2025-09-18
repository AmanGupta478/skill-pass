/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Entry` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `Entry` table. All the data in the column will be lost.
  - You are about to drop the column `links` on the `Entry` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Entry` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Entry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Entry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
-- AlterTable
ALTER TABLE "public"."Entry"
  ADD COLUMN "fileName" TEXT,
  ADD COLUMN "fileType" TEXT,
  ADD COLUMN "fileData" BYTEA;
