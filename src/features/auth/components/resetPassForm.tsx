"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
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

const resetPassSchema = z.object({
  password: z.string().min(6, "Password should be of minimum 6 letters."),
});

type ResetPassValues = z.infer<typeof resetPassSchema>;

export const ResetPassForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<ResetPassValues>({
    resolver: zodResolver(resetPassSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (values: ResetPassValues) => {
    if (!token) {
      toast.error("Invalid reset token.");
      return;
    }

    await authClient.resetPassword(
      {
        newPassword: values.password,
        token: token,
      },
      {
        onSuccess: () => {
          toast.success("Password updated! You can now sign in.");
          router.push("/signin");
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
        <CardTitle>New Password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting || !token}
            >
              {form.formState.isSubmitting ? "Updating..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
