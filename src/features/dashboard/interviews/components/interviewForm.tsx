"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateInterview } from "../hooks/useInterviews";
import { useMyResume } from "@/features/dashboard/resume/hooks/useResume";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import {
  Loader2,
  PlayCircle,
  Minus,
  Plus,
  CheckCheck,
  Lock,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/others/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Difficulty,
  InterviewType,
  ProgrammingLanguage,
  SeniorityLevel,
} from "@/config/enums";
import {
  difficultyOptions,
  interviewTypeOptions,
  languageOptions,
  seniorityOptions,
} from "../types/typeOptions";
import { LIMITS } from "@/config/constants";
import { toast } from "sonner";

const MAX_QUESTIONS = LIMITS.PRO_MAX_QUESTIONS;
const ALL_TYPES = interviewTypeOptions.map((opt) => opt.value);
const RESUME_GATED_TYPES = new Set([
  InterviewType.RESUME_BASED,
  InterviewType.DOMAIN_SPECIFIC,
]);

const interviewSchema = z
  .object({
    title: z.string().trim().max(80, "Keep it under 80 characters").optional(),
    types: z
      .array(z.enum(InterviewType))
      .min(1, "Select at least one interview type"),
    difficulty: z.enum(Difficulty),
    seniorityLevel: z.enum(SeniorityLevel),
    language: z.enum(ProgrammingLanguage).optional(),
    questionCounts: z.record(z.string(), z.number().int().min(1)),
  })
  .refine(
    (data) =>
      data.types.reduce(
        (sum, type) => sum + (data.questionCounts[type] ?? 1),
        0,
      ) <= MAX_QUESTIONS,
    {
      message: `Total questions across all selected types can't exceed ${MAX_QUESTIONS}`,
      path: ["questionCounts"],
    },
  );

type InterviewFormValues = z.infer<typeof interviewSchema>;

export const InterviewForm = () => {
  const router = useRouter();
  const { modal, handleError } = useUpgradeModal();
  const createInterview = useCreateInterview();

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      title: "",
      types: [InterviewType.CODING],
      difficulty: Difficulty.EASY,
      seniorityLevel: SeniorityLevel.ENTRY,
      language: ProgrammingLanguage.PYTHON,
      questionCounts: { [InterviewType.CODING]: 1 },
    },
  });

  const {
    data: resume,
    isLoading: isResumeLoading,
    isError: isResumeError,
  } = useMyResume();
  const hasResume = Boolean(resume);
  const isResumeGateBlocking = isResumeLoading || isResumeError || !hasResume;

  const resumeGateMessage = isResumeError
    ? "We couldn't check your resume status. Please refresh and try again."
    : !isResumeLoading && !hasResume
      ? "Resume Based and Domain Specific interviews need a submitted resume."
      : null;

  const types = form.watch("types");
  const questionCounts = form.watch("questionCounts");
  const availableTypes = ALL_TYPES.filter(
    (t) => !RESUME_GATED_TYPES.has(t) || !isResumeGateBlocking,
  );
  const isAllSelected = availableTypes.every((t) => types.includes(t));
  const totalQuestions = types.reduce(
    (sum, type) => sum + (questionCounts[type] ?? 1),
    0,
  );

  useEffect(() => {
    if (!isResumeGateBlocking) return;

    const blocked = types.filter((t) => RESUME_GATED_TYPES.has(t));
    if (blocked.length === 0) return;

    const nextTypes = types.filter((t) => !RESUME_GATED_TYPES.has(t));

    if (nextTypes.length === 0) {
      form.setValue("types", [InterviewType.CODING], {
        shouldValidate: true,
      });
      if (questionCounts[InterviewType.CODING] === undefined) {
        form.setValue("questionCounts", {
          ...questionCounts,
          [InterviewType.CODING]: 1,
        });
      }
      return;
    }

    form.setValue("types", nextTypes, { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResumeGateBlocking]);

  const toggleType = (value: InterviewType) => {
    if (RESUME_GATED_TYPES.has(value) && isResumeGateBlocking) return;

    const isSelected = types.includes(value);

    if (isSelected) {
      if (types.length === 1) return;
      form.setValue(
        "types",
        types.filter((t) => t !== value),
        { shouldValidate: true },
      );
      return;
    }

    form.setValue("types", [...types, value], { shouldValidate: true });
    if (questionCounts[value] === undefined) {
      form.setValue(
        "questionCounts",
        { ...questionCounts, [value]: 1 },
        { shouldValidate: true },
      );
    }
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      form.setValue("types", [InterviewType.CODING], {
        shouldValidate: true,
      });
      return;
    }

    const nextCounts = { ...questionCounts };
    for (const t of availableTypes) {
      if (nextCounts[t] === undefined) nextCounts[t] = 1;
    }
    form.setValue("questionCounts", nextCounts);
    form.setValue("types", availableTypes, { shouldValidate: true });
  };

  const updateCount = (type: InterviewType, delta: number) => {
    const current = questionCounts[type] ?? 1;
    const next = current + delta;
    if (next < 1) return;
    if (totalQuestions - current + next > MAX_QUESTIONS) return;
    form.setValue(
      "questionCounts",
      { ...questionCounts, [type]: next },
      { shouldValidate: true },
    );
  };

  const onSubmit = (values: InterviewFormValues) => {
    const selections = values.types.map((type) => ({
      type,
      count: values.questionCounts[type] ?? 1,
    }));

    createInterview.mutate(
      {
        title: values.title,
        selections,
        difficulty: values.difficulty,
        seniorityLevel: values.seniorityLevel,
        language: values.language,
      },
      {
        onSuccess: (data) => router.push(`/interviews/${data.id}`),
        onError: (err) => handleError(err),
      },
    );
  };

  return (
    <Form {...form}>
      {modal}
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          toast.error(`Validation failed: ${errors}`);
        })}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Name your session{" "}
                <span className="normal-case font-normal opacity-60">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Google onsite prep, round 2"
                  className="h-11 rounded-xl"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="types"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Interview Type{" "}
                  <span className="normal-case font-normal opacity-60">
                    (select one or more)
                  </span>
                </FormLabel>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all",
                    isAllSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  <CheckCheck className="size-3.5" />
                  {isAllSelected ? "All selected" : "Select all"}
                </button>
              </div>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {interviewTypeOptions.map((opt) => {
                    const isActive = field.value.includes(opt.value);
                    const isLocked =
                      RESUME_GATED_TYPES.has(opt.value) && isResumeGateBlocking;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={isLocked}
                        onClick={() => toggleType(opt.value)}
                        title={
                          isLocked
                            ? (resumeGateMessage ?? undefined)
                            : undefined
                        }
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background border-border hover:border-primary/50 text-muted-foreground hover:text-foreground",
                          isLocked &&
                            "opacity-40 cursor-not-allowed grayscale bg-muted/20 border-dashed hover:border-border",
                        )}
                      >
                        {isLocked ? (
                          <Lock className="size-4" />
                        ) : (
                          <opt.icon className="size-4" />
                        )}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              {resumeGateMessage && (
                <Alert variant={isResumeError ? "destructive" : "default"}>
                  <TriangleAlert className="size-4" />
                  <AlertDescription>
                    {resumeGateMessage}{" "}
                    {!isResumeError && (
                      <Link href="/resume" className="font-medium">
                        Submit your resume
                      </Link>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Difficulty
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-3 gap-3">
                  {difficultyOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
                        field.value === opt.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-border-foreground",
                      )}
                    >
                      <opt.icon
                        className={cn(
                          "size-6",
                          field.value === opt.value
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                      <span className="text-sm font-semibold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="questionCounts"
          render={() => (
            <FormItem className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {types.length > 1
                    ? "Questions per type"
                    : `Number of ${interviewTypeOptions.find((o) => o.value === types[0])?.label ?? ""} questions`}
                </FormLabel>
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  {totalQuestions}/{MAX_QUESTIONS} total
                </span>
              </div>
              <FormControl>
                <div className="space-y-2">
                  {interviewTypeOptions
                    .filter((opt) => types.includes(opt.value))
                    .map((opt) => {
                      const count = questionCounts[opt.value] ?? 1;
                      return (
                        <div
                          key={opt.value}
                          className={cn(
                            "flex items-center gap-4",
                            types.length > 1 &&
                              "p-3 rounded-xl border bg-background",
                          )}
                        >
                          {types.length > 1 && (
                            <div className="flex items-center gap-2 text-sm font-medium flex-1 min-w-0">
                              <opt.icon className="size-4 shrink-0 text-muted-foreground" />
                              <span className="truncate">{opt.label}</span>
                            </div>
                          )}
                          <div className="flex items-center rounded-xl border overflow-hidden shrink-0">
                            <button
                              type="button"
                              onClick={() => updateCount(opt.value, -1)}
                              disabled={count <= 1}
                              className="flex items-center justify-center size-10 text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                              <Minus className="size-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-bold tabular-nums">
                              {count}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCount(opt.value, 1)}
                              disabled={totalQuestions >= MAX_QUESTIONS}
                              className="flex items-center justify-center size-10 text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </FormControl>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {types.length > 1
                  ? "Adjust how many questions of each type to include - back-to-back in this session."
                  : "Back-to-back questions in this session."}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seniorityLevel"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Seniority Level
              </FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {seniorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all",
                        field.value === opt.value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background border-border hover:border-primary/50 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <opt.icon
                        className={cn(
                          "size-3.5",
                          field.value === opt.value
                            ? "text-primary-foreground"
                            : "text-muted-foreground",
                        )}
                      />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {types.includes(InterviewType.CODING) && (
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Programming Language
                </FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {languageOptions.map((lang) => {
                      const isActive = field.value === lang.value;

                      return (
                        <button
                          key={lang.value}
                          type="button"
                          disabled={lang.disabled}
                          onClick={() => field.onChange(lang.value)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all relative",
                            isActive
                              ? "bg-primary text-primary-foreground border-primary shadow-md"
                              : "bg-background border-border text-muted-foreground hover:border-primary/50",
                            lang.disabled &&
                              "opacity-40 cursor-not-allowed grayscale bg-muted/20 border-dashed",
                          )}
                        >
                          <lang.icon
                            className="size-4"
                            style={{ color: isActive ? "inherit" : lang.color }}
                          />
                          {lang.label}

                          {lang.disabled && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground/50"></span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full font-bold shadow-lg shadow-primary/20"
          disabled={createInterview.isPending}
        >
          {createInterview.isPending ? (
            <Loader2 className="mr-2 size-5 animate-spin" />
          ) : (
            <PlayCircle className="mr-2 size-5" />
          )}
          Start Interview
        </Button>
      </form>
    </Form>
  );
};
