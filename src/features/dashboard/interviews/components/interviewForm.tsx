"use client";

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
import { useCreateInterview } from "../hooks/useInterviews";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { Loader2, PlayCircle, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
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

const MAX_QUESTIONS = LIMITS.PRO_MAX_QUESTIONS;

const interviewSchema = z.object({
  title: z.string().trim().max(80, "Keep it under 80 characters").optional(),
  type: z.enum(InterviewType),
  difficulty: z.enum(Difficulty),
  seniorityLevel: z.enum(SeniorityLevel),
  language: z.enum(ProgrammingLanguage).optional(),
  numQuestions: z.number().int().min(1).max(MAX_QUESTIONS),
});

export const InterviewForm = () => {
  const router = useRouter();
  const { modal, handleError } = useUpgradeModal();
  const createInterview = useCreateInterview();

  const form = useForm<z.infer<typeof interviewSchema>>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      title: "",
      type: InterviewType.CODING,
      difficulty: Difficulty.EASY,
      seniorityLevel: SeniorityLevel.ENTRY,
      language: ProgrammingLanguage.PYTHON,
      numQuestions: 1,
    },
  });

  const onSubmit = (values: z.infer<typeof interviewSchema>) => {
    createInterview.mutate(values, {
      onSuccess: (data) => router.push(`/interviews/${data.id}`),
      onError: (err) => handleError(err),
    });
  };

  return (
    <Form {...form}>
      {modal}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Interview Type
              </FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {interviewTypeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                        field.value === opt.value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background border-border hover:border-primary/50 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <opt.icon className="size-4" />
                      {opt.label}
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
          name="numQuestions"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Number of {form.watch("type") === "CODING" ? "coding " : ""}
                questions
              </FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-xl border overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        field.onChange(Math.max(1, field.value - 1))
                      }
                      disabled={field.value <= 1}
                      className="flex items-center justify-center size-10 text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold tabular-nums">
                      {field.value}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        field.onChange(Math.min(MAX_QUESTIONS, field.value + 1))
                      }
                      disabled={field.value >= MAX_QUESTIONS}
                      className="flex items-center justify-center size-10 text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {form.watch("type") === "CODING"
                      ? "Plus one behavioral warm-up question to open the session."
                      : "Back-to-back questions in this session."}
                  </p>
                </div>
              </FormControl>
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

        {form.watch("type") === "CODING" && (
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
