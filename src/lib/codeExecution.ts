import {
  PROGRAMMING_LANGUAGE_LABELS,
  ProgrammingLanguage,
} from "@/config/enums";
import { envSchem } from "@/config/envSchema";

const CODESERVER_LANGUAGE_IDS: Partial<Record<ProgrammingLanguage, string>> =
  {
    [ProgrammingLanguage.JAVASCRIPT]: "javascript",
    [ProgrammingLanguage.PYTHON]: "python",
  };

export const EXECUTABLE_LANGUAGES = Object.keys(
  CODESERVER_LANGUAGE_IDS,
) as ProgrammingLanguage[];

export function isExecutableLanguage(
  language: ProgrammingLanguage,
): boolean {
  return language in CODESERVER_LANGUAGE_IDS;
}

interface CodeServerResponse {
  stdout: string;
  stderr: string;
  exit_code: number;
  timed_out: boolean;
  error: string | null;
}

async function executeOnCodeServer(params: {
  language: ProgrammingLanguage;
  code: string;
  stdin: string;
}): Promise<CodeServerResponse> {
  const codeServerLanguage = CODESERVER_LANGUAGE_IDS[params.language];

  if (!codeServerLanguage) {
    throw new Error(
      `${PROGRAMMING_LANGUAGE_LABELS[params.language]} is not supported by the code execution sandbox. Only JavaScript and Python are currently supported.`,
    );
  }

  const response = await fetch(`${envSchem.CODESERVER_API_URL}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": envSchem.CODESERVER_APIKEY,
    },
    body: JSON.stringify({
      language: codeServerLanguage,
      code: params.code,
      stdin: params.stdin ?? "",
    }),
    signal: AbortSignal.timeout(envSchem.CODESERVER_TIMEOUT_MS),
  }).catch((err: unknown) => {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error(
        "Code execution sandbox did not respond in time (request timed out).",
      );
    }
    throw new Error(
      `Could not reach the code execution sandbox at ${envSchem.CODESERVER_API_URL}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Code execution sandbox request failed with status ${response.status}: ${body}`,
    );
  }

  return (await response.json()) as CodeServerResponse;
}

export interface TestCaseExecutionResult {
  testCaseId: string;
  passed: boolean;
  status: string;
  stdout: string | null;
  error: string | null;
  expected: string;
  executionTimeMs: number;
  memoryUsedKb: number;
}

export async function runAgainstTestCases(params: {
  language: ProgrammingLanguage;
  code: string;
  testCases: { id: string; input: string; expectedOutput: string }[];
}): Promise<TestCaseExecutionResult[]> {
  if (!isExecutableLanguage(params.language)) {
    const label = PROGRAMMING_LANGUAGE_LABELS[params.language];
    return params.testCases.map((testCase) => ({
      testCaseId: testCase.id,
      passed: false,
      status: "Unsupported Language",
      stdout: null,
      error: `${label} is not supported by the code execution sandbox. Only JavaScript and Python are currently supported.`,
      expected: testCase.expectedOutput,
      executionTimeMs: 0,
      memoryUsedKb: 0,
    }));
  }

  const results: TestCaseExecutionResult[] = [];

  for (const testCase of params.testCases) {
    const startedAt = Date.now();
    const raw = await executeOnCodeServer({
      language: params.language,
      code: params.code,
      stdin: testCase.input,
    });
    const executionTimeMs = Date.now() - startedAt;

    const actualOutput = (raw.stdout ?? "").trim();
    const expectedOutput = testCase.expectedOutput.trim();

    let status: string;
    let passed: boolean;

    if (raw.timed_out) {
      status = "Time Limit Exceeded";
      passed = false;
    } else if (raw.error || raw.exit_code !== 0) {
      status = "Runtime Error";
      passed = false;
    } else if (actualOutput === expectedOutput) {
      status = "Accepted";
      passed = true;
    } else {
      status = "Wrong Answer";
      passed = false;
    }

    results.push({
      testCaseId: testCase.id,
      passed,
      status,
      stdout: raw.stdout,
      error: passed ? null : raw.error || raw.stderr || null,
      expected: testCase.expectedOutput,
      executionTimeMs,
      memoryUsedKb: 0,
    });
  }

  return results;
}

export function summarizeResults(results: TestCaseExecutionResult[]) {
  const totalTestCases = results.length;
  const passedTestCases = results.filter((r) => r.passed).length;

  const hasError = results.some(
    (r) =>
      r.status === "Runtime Error" || r.status === "Unsupported Language",
  );
  const hasTimeout = results.some((r) => r.status === "Time Limit Exceeded");

  let result: "PASSED" | "FAILED" | "PARTIAL" | "ERROR" | "TIMEOUT";

  if (totalTestCases > 0 && passedTestCases === totalTestCases) {
    result = "PASSED";
  } else if (passedTestCases === 0 && hasError) {
    result = "ERROR";
  } else if (passedTestCases === 0 && hasTimeout) {
    result = "TIMEOUT";
  } else if (passedTestCases === 0) {
    result = "FAILED";
  } else {
    result = "PARTIAL";
  }

  const executionTimeMs = results.reduce(
    (max, r) => Math.max(max, r.executionTimeMs),
    0,
  );
  const memoryUsedKb = results.reduce(
    (max, r) => Math.max(max, r.memoryUsedKb),
    0,
  );

  return {
    totalTestCases,
    passedTestCases,
    result,
    executionTimeMs,
    memoryUsedKb,
  };
}
