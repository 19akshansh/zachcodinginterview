/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `recruiter_invite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[interviewId]` on the table `recruiter_invite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `recruiter_invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `recruiter_invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seniorityLevel` to the `recruiter_invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `recruiter_invite` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "QuestionApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RecruiterDecision" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "interview" ADD COLUMN     "recruiterDecision" "RecruiterDecision",
ADD COLUMN     "recruiterDecisionAt" TIMESTAMP(3),
ADD COLUMN     "recruiterFeedback" TEXT;

-- AlterTable
ALTER TABLE "question" ADD COLUMN     "approvalStatus" "QuestionApprovalStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "recruiter_invite" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "difficulty" "Difficulty" NOT NULL,
ADD COLUMN     "interviewId" TEXT,
ADD COLUMN     "seniorityLevel" "SeniorityLevel" NOT NULL,
ADD COLUMN     "type" "InterviewType" NOT NULL;

-- CreateTable
CREATE TABLE "recruiter_application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruiter_application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recruiter_application_userId_idx" ON "recruiter_application"("userId");

-- CreateIndex
CREATE INDEX "recruiter_application_status_idx" ON "recruiter_application"("status");

-- CreateIndex
CREATE INDEX "interview_recruiterDecision_idx" ON "interview"("recruiterDecision");

-- CreateIndex
CREATE INDEX "question_createdByUserId_idx" ON "question"("createdByUserId");

-- CreateIndex
CREATE INDEX "question_isPublic_approvalStatus_idx" ON "question"("isPublic", "approvalStatus");

-- CreateIndex
CREATE UNIQUE INDEX "recruiter_invite_code_key" ON "recruiter_invite"("code");

-- CreateIndex
CREATE UNIQUE INDEX "recruiter_invite_interviewId_key" ON "recruiter_invite"("interviewId");

-- CreateIndex
CREATE INDEX "recruiter_invite_code_idx" ON "recruiter_invite"("code");

-- AddForeignKey
ALTER TABLE "recruiter_application" ADD CONSTRAINT "recruiter_application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiter_application" ADD CONSTRAINT "recruiter_application_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiter_invite" ADD CONSTRAINT "recruiter_invite_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;
