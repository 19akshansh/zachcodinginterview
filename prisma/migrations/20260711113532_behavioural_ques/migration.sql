-- AlterTable
ALTER TABLE "interview" ADD COLUMN     "behavioralQuestionId" TEXT;

-- AlterTable
ALTER TABLE "submission" ADD COLUMN     "behavioralAnswer" TEXT,
ALTER COLUMN "code" DROP NOT NULL,
ALTER COLUMN "language" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "interview" ADD CONSTRAINT "interview_behavioralQuestionId_fkey" FOREIGN KEY ("behavioralQuestionId") REFERENCES "question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
