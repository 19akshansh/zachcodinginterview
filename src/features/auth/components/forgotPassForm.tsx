"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { authClient } from "@/lib/authClient";
import { useEffect, useRef, useState } from "react";

const forgotPassSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ForgotPassValues = z.infer<typeof forgotPassSchema>;

export const ForgotPassForm = () => {
  const [canSend, setCanSend] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<ForgotPassValues>({
    resolver: zodResolver(forgotPassSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const onSubmit = async (values: ForgotPassValues) => {
    if (!canSend) {
      toast.error("Please wait 2 minutes before requesting another link.");
      return;
    }

    await authClient.requestPasswordReset(
      {
        email: values.email,
        redirectTo: "/resetPass",
      },
      {
        onSuccess: () => {
          toast.success("If an account exists, a reset link has been sent.");

          setCanSend(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);

          timeoutRef.current = setTimeout(() => {
            setCanSend(true);
            timeoutRef.current = null;
          }, 60000 * 2);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to receive a password reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="xyz@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting || !canSend}
            >
              {!canSend
                ? "Wait 2 mins..."
                : form.formState.isSubmitting
                  ? "Sending..."
                  : "Send Reset Link"}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href={"/signin"} className="underline underline-offset-4">
                Sign in
              </Link>
            </div>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href={"/signup"} className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
