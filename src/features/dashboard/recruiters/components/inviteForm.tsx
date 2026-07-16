"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2Icon, SendIcon } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Difficulty, InterviewType, SeniorityLevel } from "@/config/enums";
import {
  difficultyOptions,
  interviewTypeOptions,
  seniorityOptions,
} from "@/features/dashboard/interviews/types/typeOptions";
import { useInviteCandidate } from "../hooks/useRecruiters";

const inviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  type: z.enum(InterviewType),
  difficulty: z.enum(Difficulty),
  seniorityLevel: z.enum(SeniorityLevel),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const defaultValues: InviteFormValues = {
  email: "",
  type: InterviewType.CODING,
  difficulty: Difficulty.EASY,
  seniorityLevel: SeniorityLevel.ENTRY,
};

export const InviteForm = () => {
  const inviteCandidate = useInviteCandidate();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues,
  });

  const onSubmit = (values: InviteFormValues) => {
    inviteCandidate.mutate(values, {
      onSuccess: () => form.reset(defaultValues),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite a candidate</CardTitle>
        <CardDescription>
          We&apos;ll email them a code. They redeem it from their account to
          start the interview you configure here.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Candidate email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="candidate@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
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
                        {interviewTypeOptions
                          .filter(
                            (opt) =>
                              opt.value !== InterviewType.RESUME_BASED &&
                              opt.value !== InterviewType.DOMAIN_SPECIFIC,
                          )
                          .map((opt) => (
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
                    <FormLabel>Seniority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={inviteCandidate.isPending}
            >
              {inviteCandidate.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <SendIcon className="size-4" />
              )}
              Send invite
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
