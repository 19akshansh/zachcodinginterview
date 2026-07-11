/*
  Warnings:

  - You are about to drop the column `behavioralQuestionId` on the `interview` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `interview` table. All the data in the column will be lost.
  - You are about to drop the `submission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "interview" DROP CONSTRAINT "interview_behavioralQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "interview" DROP CONSTRAINT "interview_questionId_fkey";

-- DropForeignKey
ALTER TABLE "submission" DROP CONSTRAINT "submission_interviewId_fkey";

-- AlterTable
ALTER TABLE "interview" DROP COLUMN "behavioralQuestionId",
DROP COLUMN "questionId",
ADD COLUMN     "title" TEXT;

-- DropTable
DROP TABLE "submission";

-- CreateTable
CREATE TABLE "interview_question" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "code" TEXT,
    "language" "ProgrammingLanguage",
    "behavioralAnswer" TEXT,
    "result" "SubmissionResult",
    "passedTestCases" INTEGER,
    "totalTestCases" INTEGER,
    "executionTimeMs" INTEGER,
    "memoryUsedKb" INTEGER,
    "hints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hintLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_question_interviewId_idx" ON "interview_question"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "interview_question_interviewId_questionId_key" ON "interview_question"("interviewId", "questionId");

-- AddForeignKey
ALTER TABLE "interview_question" ADD CONSTRAINT "interview_question_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_question" ADD CONSTRAINT "interview_question_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
