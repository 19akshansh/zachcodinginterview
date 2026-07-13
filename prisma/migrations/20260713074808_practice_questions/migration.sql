-- CreateTable
CREATE TABLE "practice_attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "code" TEXT,
    "language" "ProgrammingLanguage",
    "behavioralAnswer" TEXT,
    "result" "SubmissionResult",
    "aiFeedback" TEXT,
    "passedTestCases" INTEGER,
    "totalTestCases" INTEGER,
    "executionTimeMs" INTEGER,
    "memoryUsedKb" INTEGER,
    "hints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hintLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practice_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "practice_attempt_userId_idx" ON "practice_attempt"("userId");

-- CreateIndex
CREATE INDEX "practice_attempt_questionId_idx" ON "practice_attempt"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "practice_attempt_userId_questionId_key" ON "practice_attempt"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "practice_attempt" ADD CONSTRAINT "practice_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_attempt" ADD CONSTRAINT "practice_attempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
