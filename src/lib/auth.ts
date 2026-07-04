import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import { transporter } from "./mail";
import { envSchem } from "@/config/envSchema";

export const auth = betterAuth({
  baseURL: envSchem.BETTER_AUTH_URL,
  trustedOrigins: [envSchem.NEXT_PUBLIC_APP_URL!],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await transporter.sendMail({
        from: envSchem.EMAIL_FROM,
        to: user.email,
        subject: "Reset your password",
        html: `<div
  style="
    background-color: #f4f4f5;
    padding: 40px 20px;
    font-family: Arial, Helvetica, sans-serif;"
>
  <div
    style="
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 48px 32px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    "
  >
    <div style="margin-bottom: 32px;">
      <img
        src="https://${envSchem.NEXT_PUBLIC_APP_URL}/mainAssets/logo.svg"
        alt="Zach Coding Interview"
        width="80"
        height="80"
        style="display: block; margin: 0 auto;"
      />
    </div>

    <h1
      style="
        margin: 0 0 16px;
        color: #111827;
        font-size: 28px;
        font-weight: 700;
      "
    >
      Reset Your Password
    </h1>

    <p
      style="
        margin: 0 0 32px;
        color: #6b7280;
        font-size: 16px;
        line-height: 1.6;
      "
    >
      We received a request to reset your password. Click the button below to choose a new password. This link will expire shortly.
    </p>

    <a
      href="${url}"
      style="
        display: inline-block;
        background: #111827;
        color: white;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 16px;
      "
    >
      Reset Password
    </a>

    <p style="margin-top:24px;color:#6b7280;font-size:14px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>

    <p style="word-break:break-all;font-size:13px;">
      <a href="${url}">
        ${url}
      </a>
    </p>

    <p
      style="
        margin-top: 32px;
        color: #9ca3af;
        font-size: 14px;
        line-height: 1.5;
      "
    >
      If you didn't request a password reset, you can safely ignore this email.
    </p>
  </div>
</div>`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await transporter.sendMail({
        from: envSchem.EMAIL_FROM,
        to: user.email,
        subject: "Verify your email address",
        html: `<div
  style="
    background-color: #f4f4f5;
    padding: 40px 20px;
font-family: Arial, Helvetica, sans-serif;"
>

  <div
    style="
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 48px 32px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    "
  >
    <div style="margin-bottom: 32px;">
      <img
        src="https://${envSchem.NEXT_PUBLIC_APP_URL}/mainAssets/logo.svg"
        alt="Zach Coding Interview"
        width="80"
        height="80"
        style="display: block; margin: 0 auto;"
      />
    </div>

    <h1
      style="
        margin: 0 0 16px;
        color: #111827;
        font-size: 28px;
        font-weight: 700;
      "
    >
      Verify Your Email
    </h1>

    <p
      style="
        margin: 0 0 32px;
        color: #6b7280;
        font-size: 16px;
        line-height: 1.6;
      "
    >
      Thanks for signing up! Please confirm your email address by clicking the
      button below.
    </p>

    <a
      href="${url}"
      style="
        display: inline-block;
        background: #111827;
        color: white;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 16px;
      "
    >
      Verify Email
    </a>

    <p style="margin-top: 24px; color: #6b7280; font-size: 14px;"> If the button doesn't work,
copy and paste this link into your browser: 

<p style="word-break: break-all; font-size: 13px;">
  <a href="${url}">
    ${url}
  </a>
</p>

<p
  style="
    margin-top: 32px;
    color: #9ca3af;
    font-size: 14px;
    line-height: 1.5;
  "
>
  If you didn't request this email, you can safely ignore it.
</p>`,
      });
    },
  },
  socialProviders: {
    github: {
      clientId: envSchem.GITHUB_CLIENT_ID as string,
      clientSecret: envSchem.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: envSchem.GOOGLE_CLIENT_ID as string,
      clientSecret: envSchem.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string", 
        defaultValue: "CANDIDATE",
        input: false,
      },
    },
  },
});
