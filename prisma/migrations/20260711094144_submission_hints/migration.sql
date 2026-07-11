-- AlterTable
ALTER TABLE "submission" ADD COLUMN     "hintLevel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hints" TEXT[] DEFAULT ARRAY[]::TEXT[];
