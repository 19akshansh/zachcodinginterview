import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { envSchem } from "@/config/envSchema";
import {
  Difficulty,
  InterviewType,
  INTERVIEW_TYPE_LABELS,
  SeniorityLevel,
  SENIORITY_LABELS,
  Verdict,
} from "@/config/enums";
import type { TestCaseExecutionResult } from "@/helpers/codeExecution";

const google = createGoogleGenerativeAI({ apiKey: envSchem.GEMINI_API_KEY });

const FALLBACK_MODELS = [
  google("gemini-3.5-flash"),
  google("gemini-3.1-flash-lite"),
] as const;

const PER_ATTEMPT_TIMEOUT_MS = 45_000;

function isRetryableAiError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    message.includes("overloaded") ||
    message.includes("503") ||
    message.includes("429") ||
    message.includes("rate limit") ||
    message.includes("unavailable") ||
    message.includes("timeout") ||
    message.includes("aborted")
  );
}

async function withModelFallback<R>(
  fn: (m: (typeof FALLBACK_MODELS)[number], signal: AbortSignal) => Promise<R>,
): Promise<R> {
  let lastError: unknown;

  for (const candidate of FALLBACK_MODELS) {
    try {
      return await fn(candidate, AbortSignal.timeout(PER_ATTEMPT_TIMEOUT_MS));
    } catch (error) {
      lastError = error;
      if (!isRetryableAiError(error)) {
        throw error;
      }
      // otherwise fall through and try the next model in the chain
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All AI model attempts failed.");
}

export const reportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  communication: z.number().min(0).max(100),
  problemSolving: z.number().min(0).max(100),
  codeQuality: z.number().min(0).max(100),
  optimization: z.number().min(0).max(100),
  cleanliness: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  timeComplexity: z.string(),
  verdict: z.enum(Verdict),
  suggestions: z.array(z.string()),
  topicScores: z.record(z.string(), z.number().min(0).max(100)),
});

export type AIReportOutput = z.infer<typeof reportSchema>;

export interface AIReportQuestionPart {
  questionTitle: string;
  questionPrompt: string;
  interviewType: InterviewType;
  code?: string;
  language?: string;
  writtenAnswer?: string;
  testResults: TestCaseExecutionResult[];
  passedTestCases: number;
  totalTestCases: number;
  hintsUsed: number;
}

export interface AIReportInput {
  questions: AIReportQuestionPart[];
}

const WRITTEN_RESPONSE_GUIDANCE: Partial<Record<InterviewType, string>> = {
  [InterviewType.BEHAVIORAL]:
    "Look for structure (STAR-style), clarity, and how they frame the situation.",
  [InterviewType.SYSTEM_DESIGN]:
    "Look for structured trade-off analysis, scalability reasoning, and clear articulation of the architecture and its components.",
  [InterviewType.RESUME_BASED]:
    "Look for concrete specifics, ownership of the work described, and clarity in how they explain their past experience.",
  [InterviewType.DOMAIN_SPECIFIC]:
    "Look for depth and accuracy of domain knowledge, and clarity of explanation.",
};

export async function generateInterviewReport(
  input: AIReportInput,
): Promise<AIReportOutput> {
  const sections = input.questions
    .map((q, i) => {
      if (q.interviewType !== InterviewType.CODING) {
        const label = INTERVIEW_TYPE_LABELS[q.interviewType];
        const guidance =
          WRITTEN_RESPONSE_GUIDANCE[q.interviewType] ??
          "Look for clarity, structure, and depth of reasoning.";

        return `Part ${i + 1} - ${label}
Question: ${q.questionTitle}
${q.questionPrompt}
Candidate's written response: ${q.writtenAnswer || "(not answered)"}

Use this response to genuinely assess communication and confidence for this part -
don't just estimate those from the code. ${guidance}
If unanswered, note that in suggestions and lean on the coding parts (if any) for those scores instead.`;
      }

      return `Part ${i + 1} - Coding problem
Question: ${q.questionTitle}
${q.questionPrompt}

Language: ${q.language || "unspecified"}
Candidate's code:
\`\`\`${q.language || ""}
${q.code || "(no code submitted)"}
\`\`\`

Test results: ${q.passedTestCases}/${q.totalTestCases} passed.
${q.testResults.map((r) => `- ${r.status}${r.error ? `: ${r.error}` : ""}`).join("\n")}

Hints used: ${q.hintsUsed}/3. Factor this into problemSolving and confidence -
more hints used should lower those scores, since a strong candidate needs less help.`;
    })
    .join("\n\n");

  const { output } = await withModelFallback((candidateModel, signal) =>
    generateText({
      model: candidateModel,
      abortSignal: signal,
      output: Output.object({
        schema: reportSchema,
      }),
      prompt: `You are a senior engineer at a top tech company reviewing a candidate's technical interview. The interview had ${input.questions.length} part(s), evaluated below. Give ONE overall assessment that reflects performance across all parts, weighting coding problems most heavily.

${sections}

Respond ONLY with valid JSON, no markdown fences, matching exactly:
{
  "overallScore": number (0-100),
  "communication": number (0-100),
  "problemSolving": number (0-100),
  "codeQuality": number (0-100),
  "optimization": number (0-100),
  "cleanliness": number (0-100),
  "confidence": number (0-100),
  "timeComplexity": string (e.g. "O(n log n)"),
  "verdict": "STRONG_HIRE" | "HIRE" | "LEAN_HIRE" | "NO_HIRE" | "STRONG_NO_HIRE",
  "suggestions": string[],
  "topicScores": { "<topic>": number (0-100) }
}`,
    }),
  );

  return output;
}

export interface AIPracticeGradeInput {
  questionTitle: string;
  questionPrompt: string;
  interviewType: InterviewType;
  answer: string;
}

export interface AIPracticeGradeOutput {
  result: "PASSED" | "PARTIAL" | "FAILED";
  feedback: string;
}

const practiceGradeSchema = z.object({
  result: z.enum(["PASSED", "PARTIAL", "FAILED"]),
  feedback: z.string(),
});

export async function evaluateTextAnswer(
  input: AIPracticeGradeInput,
): Promise<AIPracticeGradeOutput> {
  const label = INTERVIEW_TYPE_LABELS[input.interviewType];
  const guidance =
    input.interviewType === InterviewType.SYSTEM_DESIGN
      ? "Judge structured trade-off analysis, scalability reasoning, and clarity of the proposed architecture."
      : "Judge structure (ideally STAR-style), specificity, and clarity of the situation and outcome described.";

  const { output } = await withModelFallback((candidateModel, signal) =>
    generateText({
      model: candidateModel,
      abortSignal: signal,
      output: Output.object({ schema: practiceGradeSchema }),
      prompt: `You are a senior interviewer grading a candidate's standalone practice answer for a ${label} question. Be fair but rigorous - this is practice, so give actionable feedback.

Question: ${input.questionTitle}
${input.questionPrompt}

Candidate's answer:
${input.answer}

${guidance}

Assign:
- "PASSED" if the answer is strong and addresses the question well
- "PARTIAL" if it's on the right track but missing depth, structure, or key considerations
- "FAILED" if it's vague, off-topic, or missing entirely

Respond ONLY with valid JSON, no markdown fences, matching exactly:
{ "result": "PASSED" | "PARTIAL" | "FAILED", "feedback": string (2-4 sentences, specific and actionable) }`,
    }),
  );

  return output;
}

export const resumeFeedbackSchema = z.object({
  atsScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  sectionScores: z.record(z.string(), z.number().min(0).max(100)),
});

export type AIResumeFeedbackOutput = z.infer<typeof resumeFeedbackSchema>;

export async function generateResumeFeedback(
  resumeText: string,
): Promise<AIResumeFeedbackOutput> {
  const { output } = await withModelFallback((candidateModel, signal) =>
    generateText({
      model: candidateModel,
      abortSignal: signal,
      providerOptions: {
        google: {
          thinkingConfig: { thinkingLevel: "low" },
        },
      },
      output: Output.object({ schema: resumeFeedbackSchema }),
      prompt: `You are an expert technical recruiter and ATS (Applicant Tracking System) reviewing a candidate's resume. Be fair but rigorous, and give specific, actionable feedback grounded in what is actually written below - do not invent details that aren't there.

Resume content (extracted from PDF):
"""
${resumeText}
"""

Evaluate formatting/scannability, use of concrete impact and metrics, keyword relevance for the roles implied by the content, and overall clarity. The "atsScore" should reflect both how well an automated ATS would parse and rank this resume, and how strong it reads to a human reviewer - it is used as the single overall rating shown to the candidate, so weigh it carefully.

Respond ONLY with valid JSON, no markdown fences, matching exactly:
{
  "atsScore": number (0-100),
  "summary": string (2-3 sentences, overall impression),
  "strengths": string[] (specific things done well),
  "weaknesses": string[] (specific gaps or issues),
  "suggestions": string[] (concrete, actionable improvements),
  "sectionScores": { "formatting": number (0-100), "impact": number (0-100), "keywords": number (0-100), "clarity": number (0-100) }
}`,
    }),
  );

  return output;
}

export interface AIHintInput {
  questionTitle: string;
  questionPrompt: string;
  code: string;
  language: string;
  level: 1 | 2 | 3;
}

const HINT_LEVEL_INSTRUCTIONS: Record<1 | 2 | 3, string> = {
  1: "Give a small, gentle nudge pointing toward the right approach or data structure. Do NOT reveal the algorithm.",
  2: "Outline the approach in plain English or light pseudocode. Do NOT give working code.",
  3: "Give a near-complete solution with one small gap left for the candidate to fill in themselves.",
};

const generatedQuestionSchema = z.object({
  questions: z
    .array(
      z.object({
        title: z.string(),
        prompt: z.string(),
        topics: z.array(z.string()).default([]),
      }),
    )
    .min(1),
});

export type AIGeneratedQuestion = z.infer<
  typeof generatedQuestionSchema
>["questions"][number];

interface GenerateFromResumeInput {
  resumeText: string;
  count: number;
  difficulty: Difficulty;
  seniorityLevel: SeniorityLevel;
}

async function generateQuestionsFromResume(
  input: GenerateFromResumeInput,
  mode: "resume" | "domain",
): Promise<AIGeneratedQuestion[]> {
  const seniorityLabel = SENIORITY_LABELS[input.seniorityLevel];
  const difficultyLabel = input.difficulty.toLowerCase();

  const focusInstructions =
    mode === "resume"
      ? `Base every question directly on this candidate's resume - reference their actual listed projects, roles, employers, and technologies by name. Ask them to go deeper on specific things they claim to have done (their ownership, decisions, trade-offs, and impact).`
      : `First infer this candidate's domain/field of expertise from the resume (e.g. backend engineering, data science, product design, DevOps). Then write questions that test deep domain knowledge in that field - concepts, best practices, and applied scenarios a strong practitioner in that domain should know. Do not simply ask them to restate resume content; the resume is only used to determine which domain to test.`;

  const { output } = await withModelFallback((candidateModel, signal) =>
    generateText({
      model: candidateModel,
      abortSignal: signal,
      output: Output.object({ schema: generatedQuestionSchema }),
      prompt: `You are a senior interviewer preparing ${mode === "resume" ? "resume-based" : "domain-specific"} interview questions for a candidate.

Candidate resume (extracted from PDF):
"""
${input.resumeText}
"""

Candidate seniority level: ${seniorityLabel}
Target difficulty: ${difficultyLabel}

${focusInstructions}

Generate exactly ${input.count} distinct, non-overlapping question(s). Each should be answerable as a written/spoken response (no code required), calibrated to the stated seniority and difficulty.

Respond ONLY with valid JSON, no markdown fences, matching exactly:
{
  "questions": [
    {
      "title": string (short, e.g. "Scaling the payments service"),
      "prompt": string (the full question shown to the candidate, 1-4 sentences),
      "topics": string[] (1-4 short topic tags)
    }
  ]
}`,
    }),
  );

  return output.questions.slice(0, input.count);
}

export async function generateResumeBasedQuestions(
  input: GenerateFromResumeInput,
): Promise<AIGeneratedQuestion[]> {
  return generateQuestionsFromResume(input, "resume");
}

export async function generateDomainSpecificQuestions(
  input: GenerateFromResumeInput,
): Promise<AIGeneratedQuestion[]> {
  return generateQuestionsFromResume(input, "domain");
}

export async function generateHint(input: AIHintInput): Promise<string> {
  const { text } = await withModelFallback((candidateModel, signal) =>
    generateText({
      model: candidateModel,
      abortSignal: signal,
      prompt: `You are a senior engineer giving a hint during a live coding interview. Be concise - 2-4 sentences max.

Question: ${input.questionTitle}
${input.questionPrompt}

Candidate's current code (${input.language}):
\`\`\`${input.language}
${input.code}
\`\`\`

Hint level ${input.level}/3: ${HINT_LEVEL_INSTRUCTIONS[input.level]}

Respond with only the hint text, no preamble, no markdown.`,
    }),
  );

  return text.trim();
}
