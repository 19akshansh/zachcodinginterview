"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2Icon, PlusIcon, XIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
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
import { useCreateQuestion } from "../hooks/useRecruiters";

const NONE = "__none__";

const questionSchema = z.object({
  type: z.enum(InterviewType),
  title: z.string().trim().min(1, "Give the question a title"),
  prompt: z.string().trim().min(1, "Write out the prompt"),
  difficulty: z.enum(Difficulty),
  seniorityLevel: z.enum(SeniorityLevel).optional(),
  companyTier: z.enum(CompanyTier).optional(),
  isPublic: z.boolean(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

const defaultValues: QuestionFormValues = {
  type: InterviewType.CODING,
  title: "",
  prompt: "",
  difficulty: Difficulty.EASY,
  seniorityLevel: undefined,
  companyTier: undefined,
  isPublic: false,
};

export const QuestionForm = () => {
  const createQuestion = useCreateQuestion();
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues,
  });

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

  const onSubmit = (values: QuestionFormValues) => {
    createQuestion.mutate(
      { ...values, topics },
      {
        onSuccess: () => {
          form.reset(defaultValues);
          setTopics([]);
          setTopicInput("");
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a question</CardTitle>
        <CardDescription>
          Author a question for interviews you assign to candidates.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-5">
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
                    <Input
                      placeholder="e.g. Reverse a linked list"
                      {...field}
                    />
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
                    <Textarea
                      rows={5}
                      placeholder="Describe what the candidate needs to solve..."
                      {...field}
                    />
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

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <Item variant="outline">
                  <ItemContent>
                    <ItemTitle>Make this public</ItemTitle>
                    <ItemDescription>
                      Public questions are reviewed before joining the shared
                      bank. Until then, it&apos;s only used in interviews you
                      assign.
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </ItemActions>
                </Item>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" size="sm" disabled={createQuestion.isPending}>
              {createQuestion.isPending && (
                <Loader2Icon className="size-4 animate-spin" />
              )}
              Create question
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
