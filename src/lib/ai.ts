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

export interface AIReportInput {
  questionTitle: string;
  questionPrompt: string;
  code: string;
  language: string;
  testResults: TestCaseExecutionResult[];
  passedTestCases: number;
  totalTestCases: number;
  hintsUsed: number;
  behavioralQuestion?: string;
  behavioralAnswer?: string;
}

export async function generateInterviewReport(
  input: AIReportInput,
): Promise<AIReportOutput> {
  const { output } = await generateText({
    model,
    output: Output.object({
      schema: reportSchema,
    }),
    prompt: `You are a senior engineer at a top tech company reviewing a candidate's technical interview, which had two parts: a short behavioral warm-up and a coding problem.

${
  input.behavioralQuestion && input.behavioralAnswer
    ? `Part 1 - Behavioral warm-up
Question: ${input.behavioralQuestion}
Candidate's answer: ${input.behavioralAnswer}

Use this answer to genuinely assess communication and confidence - don't just estimate
those from the code. Look for structure (STAR-style), clarity, and how they frame the situation.
`
    : `Part 1 - Behavioral warm-up: not answered. Score communication and confidence
based only on code clarity/naming, and note in suggestions that the warm-up was skipped.
`
}
Part 2 - Coding problem
Question: ${input.questionTitle}
${input.questionPrompt}

Language: ${input.language}
Candidate's code:
\`\`\`${input.language}
${input.code}
\`\`\`

Test results: ${input.passedTestCases}/${input.totalTestCases} passed.
${input.testResults.map((r) => `- ${r.status}${r.error ? `: ${r.error}` : ""}`).join("\n")}

Hints used: ${input.hintsUsed}/3. Factor this into problemSolving and confidence -
more hints used should lower those scores, since a strong candidate needs less help.

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
