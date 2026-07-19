"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2Icon, PlusIcon, XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CompanyTier,
  Difficulty,
  InterviewType,
  SeniorityLevel,
} from "@/config/enums";
import {
  companyTierOptions,
  difficultyOptions,
  interviewTypeOptions,
  seniorityOptions,
} from "@/features/dashboard/interviews/types/typeOptions";
import {
  useAdminCreateQuestion,
  useAdminUpdateQuestion,
} from "../hooks/useAdmin";

const NONE = "__none__";

const questionEditSchema = z.object({
  type: z.enum(InterviewType),
  title: z.string().trim().min(1, "Give the question a title"),
  prompt: z.string().trim().min(1, "Write out the prompt"),
  difficulty: z.enum(Difficulty),
  seniorityLevel: z.enum(SeniorityLevel).optional(),
  companyTier: z.enum(CompanyTier).optional(),
});

type QuestionEditValues = z.infer<typeof questionEditSchema>;

export type QuestionEditDialogQuestion = {
  id: string;
  type: InterviewType;
  title: string;
  prompt: string;
  difficulty: Difficulty;
  seniorityLevel: SeniorityLevel | null;
  companyTier: CompanyTier | null;
  topics: string[];
};

type QuestionEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: QuestionEditDialogQuestion;
};

const EMPTY_QUESTION_DEFAULTS: QuestionEditValues = {
  type: interviewTypeOptions[0].value,
  title: "",
  prompt: "",
  difficulty: difficultyOptions[0].value,
  seniorityLevel: undefined,
  companyTier: undefined,
};

export const QuestionEditDialog = ({
  open,
  onOpenChange,
  question,
}: QuestionEditDialogProps) => {
  const isCreating = !question;
  const updateQuestion = useAdminUpdateQuestion();
  const createQuestion = useAdminCreateQuestion();
  const mutation = isCreating ? createQuestion : updateQuestion;
  const [topics, setTopics] = useState<string[]>(question?.topics ?? []);
  const [topicInput, setTopicInput] = useState("");

  const form = useForm<QuestionEditValues>({
    resolver: zodResolver(questionEditSchema),
    defaultValues: question
      ? {
          type: question.type,
          title: question.title,
          prompt: question.prompt,
          difficulty: question.difficulty,
          seniorityLevel: question.seniorityLevel ?? undefined,
          companyTier: question.companyTier ?? undefined,
        }
      : EMPTY_QUESTION_DEFAULTS,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      question
        ? {
            type: question.type,
            title: question.title,
            prompt: question.prompt,
            difficulty: question.difficulty,
            seniorityLevel: question.seniorityLevel ?? undefined,
            companyTier: question.companyTier ?? undefined,
          }
        : EMPTY_QUESTION_DEFAULTS,
    );
    setTopics(question?.topics ?? []);
    setTopicInput("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, question?.id]);

  const addTopic = () => {
    const value = topicInput.trim();
    if (!value || topics.includes(value)) {
      setTopicInput("");
      return;
    }
    setTopics((prev) => [...prev, value]);
    setTopicInput("");
  };

  const removeTopic = (topic: string) => {
    setTopics((prev) => prev.filter((t) => t !== topic));
  };

  const onSubmit = (values: QuestionEditValues) => {
    if (isCreating) {
      createQuestion.mutate(
        { ...values, topics },
        { onSuccess: () => onOpenChange(false) },
      );
      return;
    }

    updateQuestion.mutate(
      { id: question.id, ...values, topics },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full gap-4 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "New question" : "Edit question"}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Creates a public, approved question directly - it skips the recruiter review flow."
              : "Changes apply immediately, regardless of the question's current approval status."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {interviewTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {difficultyOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seniorityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Seniority level{" "}
                      <span className="font-normal opacity-60">(optional)</span>
                    </FormLabel>
                    <Select
                      value={field.value ?? NONE}
                      onValueChange={(value) =>
                        field.onChange(value === NONE ? undefined : value)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Any seniority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Any seniority</SelectItem>
                        {seniorityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyTier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Company tier{" "}
                      <span className="font-normal opacity-60">(optional)</span>
                    </FormLabel>
                    <Select
                      value={field.value ?? NONE}
                      onValueChange={(value) =>
                        field.onChange(value === NONE ? undefined : value)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Any tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Any tier</SelectItem>
                        {companyTierOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <Label>
                Topics{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTopic();
                    }
                  }}
                  placeholder="e.g. arrays, recursion — press Enter to add"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addTopic}
                >
                  <PlusIcon className="size-4" />
                </Button>
              </div>
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {topics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="gap-1">
                      {topic}
                      <button
                        type="button"
                        onClick={() => removeTopic(topic)}
                        aria-label={`Remove ${topic}`}
                      >
                        <XIcon className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2Icon className="size-4 animate-spin" />
                )}
                {isCreating ? "Create question" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
