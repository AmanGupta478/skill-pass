-- DropForeignKey
ALTER TABLE "public"."Entry" DROP CONSTRAINT "Entry_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MetricDaily" DROP CONSTRAINT "MetricDaily_profileId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Entry" ADD CONSTRAINT "Entry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MetricDaily" ADD CONSTRAINT "MetricDaily_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
