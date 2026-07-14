import { ProgrammingLanguage } from "@/config/enums";

export class EntryPointResolutionError extends Error {}

interface ParsedArg {
  name: string;
  value: unknown;
}

interface EntryPointCandidate {
  name: string;
  params: string[];
  isMethod: boolean;
}

function splitTopLevel(str: string, sep = ","): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inStr: string | null = null;
  let cur = "";
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (inStr) {
      cur += c;
      if (c === inStr && str[i - 1] !== "\\") inStr = null;
      continue;
    }
    if (c === '"' || c === "'") {
      inStr = c;
      cur += c;
      continue;
    }
    if ("([{".includes(c)) depth++;
    if (")]}".includes(c)) depth--;
    if (c === sep && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim() !== "") parts.push(cur);
  return parts.map((p) => p.trim()).filter((p) => p !== "");
}

function findTopLevelAssign(line: string): number {
  let depth = 0;
  let inStr: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inStr) {
      if (c === inStr && line[i - 1] !== "\\") inStr = null;
      continue;
    }
    if (c === '"' || c === "'") {
      inStr = c;
      continue;
    }
    if ("([{".includes(c)) depth++;
    if (")]}".includes(c)) depth--;
    if (
      depth === 0 &&
      (c === "=" || c === ":") &&
      line[i + 1] !== "=" &&
      line[i - 1] !== "=" &&
      line[i - 1] !== "!" &&
      line[i - 1] !== "<" &&
      line[i - 1] !== ">"
    ) {
      return i;
    }
  }
  return -1;
}

function parseLiteralValue(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {}
  const normalized = trimmed
    .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, s: string) => JSON.stringify(s))
    .replace(/\bTrue\b/g, "true")
    .replace(/\bFalse\b/g, "false")
    .replace(/\bNone\b/g, "null")
    .replace(/,\s*([\]}])/g, "$1");
  try {
    return JSON.parse(normalized);
  } catch {}
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return Function(`"use strict"; return (${normalized});`)();
  } catch {
    return trimmed;
  }
}

export function parseTestCaseInput(raw: string): ParsedArg[] {
  const trimmed = raw.trim();

  if (trimmed.startsWith("{")) {
    try {
      const obj = JSON.parse(trimmed);
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        return Object.entries(obj).map(([name, value]) => ({ name, value }));
      }
    } catch {}
  }

  const segments = trimmed
    .split("\n")
    .flatMap((line) => splitTopLevel(line, ","))
    .map((s) => s.trim())
    .filter((s) => s !== "");

  const named: ParsedArg[] = [];
  let allLinesNamed = segments.length > 0;
  for (const segment of segments) {
    const eqIdx = findTopLevelAssign(segment);
    if (eqIdx === -1) {
      allLinesNamed = false;
      break;
    }
    named.push({
      name: segment.slice(0, eqIdx).trim(),
      value: parseLiteralValue(segment.slice(eqIdx + 1).trim()),
    });
  }
  if (allLinesNamed) return named;

  return splitTopLevel(trimmed, ",").map((token, i) => ({
    name: `arg${i}`,
    value: parseLiteralValue(token),
  }));
}

function cleanParamName(p: string): string {
  return p
    .trim()
    .replace(/^\.\.\./, "")
    .split("=")[0]
    .trim();
}

function pickBestEntryPoint(
  candidates: EntryPointCandidate[],
  argNames: string[],
): EntryPointCandidate {
  if (candidates.length === 0) {
    throw new EntryPointResolutionError(
      "Could not find a solution to call - define a top-level function, or a `class Solution` with a public method.",
    );
  }
  if (candidates.length === 1) return candidates[0];

  const namedArgs = argNames.length > 0 && !argNames[0].startsWith("arg");
  let best = candidates[0];
  let bestScore = -1;
  for (const c of candidates) {
    const params = c.params.map(cleanParamName).filter(Boolean);
    const score = namedArgs
      ? params.filter((p) => argNames.includes(p)).length
      : params.length === argNames.length
        ? 1
        : 0;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

function orderArgsForParams(
  paramNamesRaw: string[],
  parsedArgs: ParsedArg[],
): unknown[] {
  const paramNames = paramNamesRaw.map(cleanParamName).filter(Boolean);
  const byName = new Map(parsedArgs.map((a) => [a.name, a.value]));
  const allNamesMatch =
    paramNames.length > 0 && paramNames.every((p) => byName.has(p));
  if (allNamesMatch) return paramNames.map((p) => byName.get(p));
  return parsedArgs.map((a) => a.value);
}

const JS_CONTROL_KEYWORDS = new Set([
  "if",
  "for",
  "while",
  "switch",
  "catch",
  "do",
  "function",
  "return",
  "with",
]);

function findMatchingBrace(code: string, openIdx: number): number {
  let depth = 0;
  for (let i = openIdx; i < code.length; i++) {
    if (code[i] === "{") depth++;
    else if (code[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractJsEntryPoints(code: string): EntryPointCandidate[] {
  const classMatch = code.match(/class\s+Solution\b[^{]*\{/);
  if (classMatch && classMatch.index !== undefined) {
    const openIdx = classMatch.index + classMatch[0].length - 1;
    const closeIdx = findMatchingBrace(code, openIdx);
    const body = code.slice(
      openIdx + 1,
      closeIdx === -1 ? undefined : closeIdx,
    );
    const methodRe = /(?:^|\n)\s*(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*\{/g;
    const methods: EntryPointCandidate[] = [];
    let m: RegExpExecArray | null;
    while ((m = methodRe.exec(body))) {
      if (m[1] === "constructor" || JS_CONTROL_KEYWORDS.has(m[1])) continue;
      methods.push({ name: m[1], params: splitTopLevel(m[2]), isMethod: true });
    }
    if (methods.length > 0) return methods;
  }

  const candidates: EntryPointCandidate[] = [];
  let m: RegExpExecArray | null;

  const fnDeclRe = /function\s+(\w+)\s*\(([^)]*)\)/g;
  while ((m = fnDeclRe.exec(code))) {
    candidates.push({
      name: m[1],
      params: splitTopLevel(m[2]),
      isMethod: false,
    });
  }
  const arrowRe =
    /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g;
  while ((m = arrowRe.exec(code))) {
    candidates.push({
      name: m[1],
      params: splitTopLevel(m[2]),
      isMethod: false,
    });
  }
  const arrowSingleRe =
    /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(\w+)\s*=>/g;
  while ((m = arrowSingleRe.exec(code))) {
    candidates.push({ name: m[1], params: [m[2]], isMethod: false });
  }
  const fnExprRe =
    /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?function\s*\(([^)]*)\)/g;
  while ((m = fnExprRe.exec(code))) {
    candidates.push({
      name: m[1],
      params: splitTopLevel(m[2]),
      isMethod: false,
    });
  }
  return candidates;
}

const JS_OUTPUT_FORMATTER = `
function __formatOutput(result) {
  if (typeof result === "boolean") return result ? "True" : "False";
  if (typeof result === "object" && result !== null) return JSON.stringify(result);
  return String(result);
}`;

function buildJavascriptHarness(
  candidateCode: string,
  testInput: string,
): string {
  const args = parseTestCaseInput(testInput);
  const candidates = extractJsEntryPoints(candidateCode);
  const best = pickBestEntryPoint(
    candidates,
    args.map((a) => a.name),
  );
  const ordered = orderArgsForParams(best.params, args);
  const literalArgs = ordered.map((v) => JSON.stringify(v)).join(", ");
  const call = best.isMethod
    ? `(new Solution()).${best.name}(${literalArgs})`
    : `${best.name}(${literalArgs})`;

  return `${candidateCode}

// ---- harness (generated, not part of the candidate's submission) ----
${JS_OUTPUT_FORMATTER}
console.log(__formatOutput(${call}));
`;
}

function extractPythonEntryPoints(code: string): EntryPointCandidate[] {
  const lines = code.split("\n");
  const classLineIdx = lines.findIndex((l) => /^\s*class\s+Solution\b/.test(l));

  if (classLineIdx !== -1) {
    const classIndent = lines[classLineIdx].match(/^(\s*)/)![1].length;
    const methods: EntryPointCandidate[] = [];
    for (let i = classLineIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === "") continue;
      const indent = line.match(/^(\s*)/)![1].length;
      if (indent <= classIndent) break;
      const m = line.match(
        /^\s*def\s+(\w+)\s*\(\s*self\s*(?:,\s*(.*))?\)\s*(?:->\s*[^:]+)?\s*:/,
      );
      if (m && !m[1].startsWith("__")) {
        methods.push({
          name: m[1],
          params: m[2] ? splitTopLevel(m[2]) : [],
          isMethod: true,
        });
      }
    }
    if (methods.length > 0) return methods;
  }

  const candidates: EntryPointCandidate[] = [];
  for (const line of lines) {
    const m = line.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/); // column 0 = top-level
    if (m)
      candidates.push({
        name: m[1],
        params: splitTopLevel(m[2]),
        isMethod: false,
      });
  }
  return candidates;
}

function toPythonLiteral(value: unknown): string {
  if (value === null || value === undefined) return "None";
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(toPythonLiteral).join(", ")}]`;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) => `${JSON.stringify(k)}: ${toPythonLiteral(v)}`,
    );
    return `{${entries.join(", ")}}`;
  }
  return String(value);
}

const PY_OUTPUT_FORMATTER = `
def __format_output(result):
    if isinstance(result, bool):
        return "True" if result else "False"
    if isinstance(result, (list, tuple, dict)):
        import json as __json
        return __json.dumps(result)
    return str(result)`;

function buildPythonHarness(candidateCode: string, testInput: string): string {
  const args = parseTestCaseInput(testInput);
  const candidates = extractPythonEntryPoints(candidateCode);
  const best = pickBestEntryPoint(
    candidates,
    args.map((a) => a.name),
  );
  const ordered = orderArgsForParams(best.params, args);
  const literalArgs = ordered.map(toPythonLiteral).join(", ");
  const call = best.isMethod
    ? `Solution().${best.name}(${literalArgs})`
    : `${best.name}(${literalArgs})`;

  return `${candidateCode}

# ---- harness (generated, not part of the candidate's submission) ----
${PY_OUTPUT_FORMATTER}
print(__format_output(${call}))
`;
}

export function wrapWithHarness(
  language: ProgrammingLanguage,
  code: string,
  testInput: string,
): string {
  switch (language) {
    case ProgrammingLanguage.PYTHON:
      return buildPythonHarness(code, testInput);
    case ProgrammingLanguage.JAVASCRIPT:
      return buildJavascriptHarness(code, testInput);
    default:
      return code;
  }
}
