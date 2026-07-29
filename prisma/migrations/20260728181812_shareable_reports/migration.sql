/*
  Warnings:

  - A unique constraint covering the columns `[shareId]` on the table `report` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "report" ADD COLUMN     "isShared" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "report_shareId_key" ON "report"("shareId");
