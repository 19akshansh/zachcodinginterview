-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('CODING', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'RESUME_BASED', 'DOMAIN_SPECIFIC');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('ENTRY', 'JUNIOR', 'INTERMEDIATE', 'SENIOR', 'STAFF', 'PRINCIPAL');

-- CreateEnum
CREATE TYPE "CompanyTier" AS ENUM ('STARTUP', 'MID_MARKET', 'FAANG');

-- CreateEnum
CREATE TYPE "ProgrammingLanguage" AS ENUM ('PYTHON', 'JAVA', 'JAVASCRIPT', 'TYPESCRIPT', 'CPP', 'GO', 'RUST');

-- CreateEnum
CREATE TYPE "TestCaseVisibility" AS ENUM ('PUBLIC', 'HIDDEN', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SubmissionResult" AS ENUM ('PASSED', 'FAILED', 'PARTIAL', 'ERROR', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('STRONG_HIRE', 'HIRE', 'LEAN_HIRE', 'NO_HIRE', 'STRONG_NO_HIRE');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "bannedReason" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "resumeParsedData" JSONB,
ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "skills" TEXT[];

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" "Theme" NOT NULL DEFAULT 'SYSTEM',
    "language" TEXT NOT NULL DEFAULT 'en',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "profileVisibility" "ProfileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" TEXT NOT NULL,
    "type" "InterviewType" NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "seniorityLevel" "SeniorityLevel",
    "companyTier" "CompanyTier",
    "topics" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_case" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "visibility" "TestCaseVisibility" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview" (
    "id" TEXT NOT NULL,
    "type" "InterviewType" NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "difficulty" "Difficulty" NOT NULL,
    "seniorityLevel" "SeniorityLevel" NOT NULL,
    "companyTier" "CompanyTier",
    "language" "ProgrammingLanguage",
    "candidateId" TEXT NOT NULL,
    "assignedByRecruiterId" TEXT,
    "questionId" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" "ProgrammingLanguage" NOT NULL,
    "result" "SubmissionResult",
    "passedTestCases" INTEGER,
    "totalTestCases" INTEGER,
    "executionTimeMs" INTEGER,
    "memoryUsedKb" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "communication" INTEGER,
    "problemSolving" INTEGER,
    "codeQuality" INTEGER,
    "optimization" INTEGER,
    "cleanliness" INTEGER,
    "confidence" INTEGER,
    "timeComplexity" TEXT,
    "verdict" "Verdict",
    "suggestions" TEXT[],
    "topicScores" JSONB,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruiter_invite" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "candidateEmail" TEXT NOT NULL,
    "candidateId" TEXT,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "recruiter_invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_userId_key" ON "settings"("userId");

-- CreateIndex
CREATE INDEX "question_type_idx" ON "question"("type");

-- CreateIndex
CREATE INDEX "question_difficulty_idx" ON "question"("difficulty");

-- CreateIndex
CREATE INDEX "test_case_questionId_idx" ON "test_case"("questionId");

-- CreateIndex
CREATE INDEX "interview_candidateId_idx" ON "interview"("candidateId");

-- CreateIndex
CREATE INDEX "interview_assignedByRecruiterId_idx" ON "interview"("assignedByRecruiterId");

-- CreateIndex
CREATE INDEX "interview_status_idx" ON "interview"("status");

-- CreateIndex
CREATE UNIQUE INDEX "submission_interviewId_key" ON "submission"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "report_interviewId_key" ON "report"("interviewId");

-- CreateIndex
CREATE INDEX "recruiter_invite_recruiterId_idx" ON "recruiter_invite"("recruiterId");

-- CreateIndex
CREATE INDEX "recruiter_invite_candidateEmail_idx" ON "recruiter_invite"("candidateEmail");

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_case" ADD CONSTRAINT "test_case_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview" ADD CONSTRAINT "interview_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview" ADD CONSTRAINT "interview_assignedByRecruiterId_fkey" FOREIGN KEY ("assignedByRecruiterId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview" ADD CONSTRAINT "interview_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiter_invite" ADD CONSTRAINT "recruiter_invite_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiter_invite" ADD CONSTRAINT "recruiter_invite_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
