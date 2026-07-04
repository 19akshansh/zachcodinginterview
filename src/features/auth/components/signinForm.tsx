"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FaGithub, FaGoogle } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const signinSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password should be of minimum 6 letters."),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export const SigninForm = () => {
  const [canResend, setCanResend] = useState(true);
  const resendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [canSignin, setCanSignin] = useState(true);
  const signinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();
  const form = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    return () => {
      if (resendTimeoutRef.current) clearTimeout(resendTimeoutRef.current);
      if (signinTimeoutRef.current) clearTimeout(signinTimeoutRef.current);
    };
  }, []);

  const signinGithub = async () => {
    await authClient.signIn.social(
      { provider: "github" },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: () => {
          toast.error("Github sign-in failed. Try again.");
        },
      },
    );
  };

  const signinGoogle = async () => {
    await authClient.signIn.social(
      { provider: "google" },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: () => {
          toast.error("Google sign-in failed. Try again.");
        },
      },
    );
  };

  const onSubmit = async (values: SigninFormValues) => {
    if (!canSignin) return;

    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            toast.error("Please verify your email address before signing in.", {
              action: canResend
                ? {
                    label: "Resend Link",
                    onClick: () => handleResendVerification(values.email),
                  }
                : {
                    label: "Wait 2mins",
                    onClick: () => {},
                  },
            });
          } else {
            toast.error(ctx.error.message);

            setCanSignin(false);
            signinTimeoutRef.current = setTimeout(() => {
              setCanSignin(true);
              signinTimeoutRef.current = null;
            }, 10000);
          }
        },
      },
    );
  };

  const handleResendVerification = async (email: string) => {
    if (!canResend) return;
    setCanResend(false);

    await authClient.sendVerificationEmail(
      { email, callbackURL: "/" },
      {
        onSuccess: () => {
          toast.success(`Verification email sent to ${email}!`);
          resendTimeoutRef.current = setTimeout(() => {
            setCanResend(true);
            resendTimeoutRef.current = null;
          }, 60000 * 2);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setCanResend(true);
        },
      },
    );
  };

  const isPending = form.formState.isSubmitting;

  return (
    <div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Welcome Back !</CardTitle>
          <CardDescription>Login to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    variant={"outline"}
                    className="w-full"
                    type="button"
                    disabled={isPending}
                    onClick={signinGithub}
                  >
                    <FaGithub />
                    Continue with Github
                  </Button>
                  <Button
                    variant={"outline"}
                    className="w-full"
                    type="button"
                    disabled={isPending}
                    onClick={signinGoogle}
                  >
                    <FaGoogle />
                    Continue with Google
                  </Button>
                </div>
                <div className="grid gap-6">
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
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
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
                    disabled={isPending || !canSignin}
                  >
                    {!canSignin ? "Wait a moment..." : "Signin"}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link
                    href={"/signup"}
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </div>
                <div className="text-center text-sm">
                  Forgot Your Password?{" "}
                  <Link
                    href={"/forgotPass"}
                    className="underline underline-offset-4"
                  >
                    Forgot Password
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
