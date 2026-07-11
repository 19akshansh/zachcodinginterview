import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { envSchem } from "@/config/envSchema";
import { Verdict } from "@/config/enums";
import type { TestCaseExecutionResult } from "@/lib/codeExecution";

const google = createGoogleGenerativeAI({ apiKey: envSchem.GEMINI_API_KEY });
const model = google("gemini-2.0-flash");

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
  isBehavioral: boolean;
  code?: string;
  language?: string;
  behavioralAnswer?: string;
  testResults: TestCaseExecutionResult[];
  passedTestCases: number;
  totalTestCases: number;
  hintsUsed: number;
}

export interface AIReportInput {
  questions: AIReportQuestionPart[];
}

export async function generateInterviewReport(
  input: AIReportInput,
): Promise<AIReportOutput> {
  const sections = input.questions
    .map((q, i) => {
      if (q.isBehavioral) {
        return `Part ${i + 1} - Behavioral
Question: ${q.questionTitle}
${q.questionPrompt}
Candidate's answer: ${q.behavioralAnswer || "(not answered)"}

Use this answer to genuinely assess communication and confidence - don't just estimate
those from the code. Look for structure (STAR-style), clarity, and how they frame the situation.
If unanswered, note that in suggestions and lean on the coding parts for those scores instead.`;
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

  const { output } = await generateText({
    model,
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
  });

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

export async function generateHint(input: AIHintInput): Promise<string> {
  const { text } = await generateText({
    model,
    prompt: `You are a senior engineer giving a hint during a live coding interview. Be concise - 2-4 sentences max.

Question: ${input.questionTitle}
${input.questionPrompt}

Candidate's current code (${input.language}):
\`\`\`${input.language}
${input.code}
\`\`\`

Hint level ${input.level}/3: ${HINT_LEVEL_INSTRUCTIONS[input.level]}

Respond with only the hint text, no preamble, no markdown.`,
  });

  return text.trim();
}
