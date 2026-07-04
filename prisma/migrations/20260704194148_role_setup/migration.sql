/*
  Warnings:

  - You are about to drop the column `Recruiter` on the `user` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CANDIDATE', 'RECRUITER', 'ADMIN');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "Recruiter",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CANDIDATE';
