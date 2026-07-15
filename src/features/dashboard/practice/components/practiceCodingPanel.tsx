"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/layout/individual/codeEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Play,
  SendHorizontal,
  Lightbulb,
  Check,
  X,
  Loader2,
  Sparkles,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/others/utils";
import { ProgrammingLanguage } from "@/config/enums";
import { languageOptions } from "../../interviews/types/typeOptions";
import {
  useGetPracticeHint,
  useRunPracticeCode,
  useSubmitPracticeCode,
} from "../hooks/usePractice";
import type { TestCaseExecutionResult } from "@/helpers/codeExecution";
import { useGeminiKeyModal } from "@/hooks/useGeminiKeyModal";
import { GeminiKeyNotice } from "@/components/layout/shared/geminiKeyNotice";

const EXECUTABLE_LANGUAGES = languageOptions.filter((l) => !l.disabled);

const STARTER_TEMPLATE: Partial<Record<ProgrammingLanguage, string>> = {
  [ProgrammingLanguage.PYTHON]: "# Write your solution here\n",
  [ProgrammingLanguage.JAVASCRIPT]: "// Write your solution here\n",
};

const RESULT_STYLES: Record<string, string> = {
  PASSED: "bg-green-500/10 text-green-500 border-green-500/20",
  PARTIAL: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  FAILED: "bg-destructive/10 text-destructive border-destructive/20",
  ERROR: "bg-destructive/10 text-destructive border-destructive/20",
  TIMEOUT: "bg-destructive/10 text-destructive border-destructive/20",
};

interface PracticeQuestionWithDetail {
  id: string;
  title: string;
  prompt: string;
  difficulty: string;
  topics: string[];
  testCases: { id: string; input: string; expectedOutput: string }[];
  attempt: {
    code: string | null;
    language: ProgrammingLanguage | null;
    hints: string[];
    hintLevel: number;
    result: string | null;
    passedTestCases: number | null;
    totalTestCases: number | null;
  } | null;
}

export const PracticeCodingPanel = ({
  question,
  defaultLanguage,
}: {
  question: PracticeQuestionWithDetail;
  defaultLanguage: ProgrammingLanguage;
}) => {
  const [language, setLanguage] = useState<ProgrammingLanguage>(
    question.attempt?.language ?? defaultLanguage,
  );
  const [code, setCode] = useState(
    question.attempt?.code ??
      STARTER_TEMPLATE[language] ??
      "// Write your solution here\n",
  );
  const [hints, setHints] = useState<string[]>(question.attempt?.hints ?? []);
  const [hintLevel, setHintLevel] = useState(question.attempt?.hintLevel ?? 0);
  const [activeTab, setActiveTab] = useState("tests");
  const [runResults, setRunResults] = useState<
    TestCaseExecutionResult[] | null
  >(null);

  const runCode = useRunPracticeCode();
  const submitCode = useSubmitPracticeCode();
  const getHint = useGetPracticeHint();
  const { modal: geminiKeyModal, handleError: handleGeminiKeyError } =
    useGeminiKeyModal();

  const handleRun = () => {
    setActiveTab("tests");
    runCode.mutate(
      { questionId: question.id, code, language },
      { onSuccess: (data) => setRunResults(data.results) },
    );
  };

  const handleSubmit = () => {
    setActiveTab("tests");
    submitCode.mutate({ questionId: question.id, code, language });
  };

  const handleHint = () => {
    setActiveTab("hints");
    getHint.mutate(
      { questionId: question.id, code, language },
      {
        onSuccess: (data) => {
          setHints((prev) => [...prev, data.hint]);
          setHintLevel(data.level);
        },
        onError: (err) => handleGeminiKeyError(err),
      },
    );
  };

  const publicTestCases = question.testCases;
  const lastResultBadge = question.attempt?.result;

  return (
    <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
      {geminiKeyModal}
      <ResizablePanel defaultSize={38} minSize={25}>
        <div className="h-full overflow-y-auto pr-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="text-[10px] uppercase font-bold"
            >
              Coding
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-bold"
            >
              {question.difficulty}
            </Badge>
            {lastResultBadge && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] uppercase font-bold",
                  RESULT_STYLES[lastResultBadge],
                )}
              >
                {question.attempt?.passedTestCases}/
                {question.attempt?.totalTestCases} passed
              </Badge>
            )}
          </div>

          <h2 className="text-lg font-semibold leading-tight">
            {question.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {question.prompt}
          </p>

          {question.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {question.topics.map((topic) => (
                <Badge key={topic} variant="outline" className="text-[10px]">
                  {topic}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between pt-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Lightbulb className="size-3.5" />
                Hints ({hintLevel}/3 used)
              </h3>
              <Button
                variant="outline"
                size="xs"
                onClick={handleHint}
                disabled={getHint.isPending || hintLevel >= 3}
              >
                {getHint.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {hintLevel >= 3 ? "No hints left" : "Get a hint"}
              </Button>
            </div>

            <GeminiKeyNotice message="Add a Gemini key to get hints." />

            {hints.length === 0 ? (
              <p className="text-xs text-muted-foreground/70 italic">
                Stuck? Hints cost nothing but are limited to 3 per question.
              </p>
            ) : (
              <div className="space-y-2">
                {hints.map((hint, i) => (
                  <div
                    key={i}
                    className="text-xs p-3 rounded-lg border bg-muted/30 leading-relaxed"
                  >
                    <span className="font-bold text-muted-foreground mr-1.5">
                      #{i + 1}
                    </span>
                    {hint}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={62} minSize={35}>
        <ResizablePanelGroup orientation="vertical" className="h-full pl-4">
          <ResizablePanel
            defaultSize={65}
            minSize={30}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {EXECUTABLE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => setLanguage(lang.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                      language === lang.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-muted-foreground hover:border-primary/50",
                    )}
                  >
                    <lang.icon className="size-3.5" />
                    {lang.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRun}
                  disabled={runCode.isPending || submitCode.isPending}
                >
                  {runCode.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Play className="size-3.5" />
                  )}
                  Run
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={submitCode.isPending || runCode.isPending}
                >
                  {submitCode.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <SendHorizontal className="size-3.5" />
                  )}
                  Submit
                </Button>
              </div>
            </div>

            <CodeEditor value={code} onChange={setCode} language={language} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={35}
            minSize={20}
            className="pt-3 min-h-0 flex flex-col"
          >
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as string)}
              className="min-h-0 flex-1 flex flex-col"
            >
              <TabsList className="self-start">
                <TabsTrigger value="tests">Test Cases</TabsTrigger>
                <TabsTrigger value="hints">Hints</TabsTrigger>
              </TabsList>

              <TabsContent
                value="tests"
                className="overflow-y-auto mt-2 space-y-2"
              >
                {runResults === null && !lastResultBadge ? (
                  <div className="grid gap-2">
                    {publicTestCases.map((tc) => (
                      <div
                        key={tc.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card text-sm"
                      >
                        <span className="font-mono text-xs text-muted-foreground truncate">
                          Input: {tc.input} &rarr; Expected: {tc.expectedOutput}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 text-sm opacity-60">
                      <Lock className="size-4" />
                      <span className="font-medium italic">
                        Hidden test cases run on submit
                      </span>
                    </div>
                  </div>
                ) : runResults ? (
                  <div className="grid gap-2">
                    {runResults.map((r, i) => (
                      <div
                        key={r.testCaseId}
                        className={cn(
                          "flex flex-col gap-1 p-3 rounded-lg border text-sm",
                          r.passed
                            ? "bg-green-500/5 border-green-500/20"
                            : "bg-destructive/5 border-destructive/20",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {r.passed ? (
                            <Check className="size-4 text-green-500 shrink-0" />
                          ) : (
                            <X className="size-4 text-destructive shrink-0" />
                          )}
                          <span className="font-semibold text-xs">
                            Test case {i + 1} &middot; {r.status}
                          </span>
                          <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                            {r.executionTimeMs}ms
                          </span>
                        </div>
                        {!r.passed && (
                          <div className="font-mono text-xs text-muted-foreground pl-6 space-y-0.5">
                            <div>Expected: {r.expected}</div>
                            <div>
                              Got: {r.stdout || r.error || "(no output)"}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 text-sm text-muted-foreground">
                    Last submission &mdash; {question.attempt?.passedTestCases}/
                    {question.attempt?.totalTestCases} test cases passed (
                    {question.attempt?.result}). Run again to see fresh output.
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="hints"
                className="overflow-y-auto mt-2 space-y-2"
              >
                {hints.length === 0 ? (
                  <p className="text-xs text-muted-foreground/70 italic p-3">
                    No hints requested yet for this question.
                  </p>
                ) : (
                  hints.map((hint, i) => (
                    <div
                      key={i}
                      className="text-xs p-3 rounded-lg border bg-muted/30 leading-relaxed"
                    >
                      <span className="font-bold text-muted-foreground mr-1.5">
                        #{i + 1}
                      </span>
                      {hint}
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
