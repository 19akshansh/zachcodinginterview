import { TRPCError } from "@trpc/server";
import prisma from "@/lib/db/db";
import {
  Difficulty,
  INTERVIEW_TYPE_LABELS,
  InterviewType,
  SeniorityLevel,
} from "@/config/enums";
import {
  generateDomainSpecificQuestions,
  generateResumeBasedQuestions,
  InvalidGeminiKeyError,
} from "@/helpers/ai";

interface GenerateAndPersistParams {
  apiKey: string;
  userId: string;
  type: InterviewType.RESUME_BASED | InterviewType.DOMAIN_SPECIFIC;
  count: number;
  difficulty: Difficulty;
  seniorityLevel: SeniorityLevel;
}

export async function generateAndPersistResumeQuestions({
  apiKey,
  userId,
  type,
  count,
  difficulty,
  seniorityLevel,
}: GenerateAndPersistParams): Promise<string[]> {
  const resume = await prisma.resume.findUnique({
    where: { userId },
    select: { parsedText: true },
  });

  if (!resume) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Upload a resume before selecting ${INTERVIEW_TYPE_LABELS[type]} interviews. Head to the Resume page to submit one first.`,
    });
  }

  if (!resume.parsedText || !resume.parsedText.trim()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "We couldn't read any text from your resume, so we can't generate questions from it. Please re-upload a readable PDF.",
    });
  }

  const generator =
    type === InterviewType.RESUME_BASED
      ? generateResumeBasedQuestions
      : generateDomainSpecificQuestions;

  let generated: Awaited<ReturnType<typeof generator>>;
  try {
    generated = await generator(apiKey, {
      resumeText: resume.parsedText,
      count,
      difficulty,
      seniorityLevel,
    });
  } catch (error) {
    if (error instanceof InvalidGeminiKeyError) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message,
        cause: error,
      });
    }

    console.error("RESUME_QUESTION_GENERATION_FAILED", type, error);
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: `We couldn't generate ${INTERVIEW_TYPE_LABELS[type]} questions right now. Please try again.`,
    });
  }

  if (!generated.length) {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: `We couldn't generate ${INTERVIEW_TYPE_LABELS[type]} questions right now. Please try again.`,
    });
  }

  const created = await prisma.$transaction(
    generated.map((q) =>
      prisma.question.create({
        data: {
          type,
          title: q.title,
          prompt: q.prompt,
          difficulty,
          seniorityLevel,
          topics: q.topics,
        },
        select: { id: true },
      }),
    ),
  );

  return created.map((q) => q.id);
}
