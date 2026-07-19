"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRoundIcon,
  Loader2Icon,
  PlayCircleIcon,
  TicketIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRedeemInviteCode } from "@/features/recruiters/hooks/useRecruiters";
import { InterviewForm } from "./interviewForm";

const CODE_LENGTH = 8;

type GateMode = "choice" | "code" | "form";

const ChoiceScreen = ({
  onHaveCode,
  onStartNew,
}: {
  onHaveCode: () => void;
  onStartNew: () => void;
}) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <Card
      role="button"
      tabIndex={0}
      onClick={onHaveCode}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onHaveCode()}
      className="cursor-pointer p-6 transition-colors hover:border-primary/50"
    >
      <CardContent className="flex flex-col items-start gap-3 p-0">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <TicketIcon className="size-5" />
        </div>
        <div>
          <p className="font-semibold">I have an invite code</p>
          <p className="text-sm text-muted-foreground">
            A recruiter sent you a code to start a specific interview.
          </p>
        </div>
      </CardContent>
    </Card>

    <Card
      role="button"
      tabIndex={0}
      onClick={onStartNew}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onStartNew()}
      className="cursor-pointer p-6 transition-colors hover:border-primary/50"
    >
      <CardContent className="flex flex-col items-start gap-3 p-0">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <PlayCircleIcon className="size-5" />
        </div>
        <div>
          <p className="font-semibold">Start a new interview</p>
          <p className="text-sm text-muted-foreground">
            Pick your own type, difficulty, and seniority level.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const CodeScreen = ({ onBack }: { onBack: () => void }) => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [notFound, setNotFound] = useState(false);
  const redeemInviteCode = useRedeemInviteCode();

  const handleSubmit = () => {
    if (code.length < CODE_LENGTH) return;

    setNotFound(false);
    redeemInviteCode.mutate(
      { code },
      {
        onSuccess: (result) => {
          if (result.found) {
            router.push(`/interviews/${result.interviewId}`);
            return;
          }
          setNotFound(true);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <KeyRoundIcon className="size-5" />
        </div>
        <div>
          <p className="font-semibold">Enter your invite code</p>
          <p className="text-sm text-muted-foreground">
            Check the email your recruiter sent you.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <InputOTP
          maxLength={CODE_LENGTH}
          value={code}
          onChange={(value) => setCode(value.toUpperCase())}
          pattern="^[A-Za-z0-9]*$"
          disabled={redeemInviteCode.isPending}
        >
          <InputOTPGroup>
            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <InputOTPSlot key={i} index={i} className="font-mono uppercase" />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <Button
          type="button"
          className="w-full max-w-xs"
          disabled={code.length < CODE_LENGTH || redeemInviteCode.isPending}
          onClick={handleSubmit}
        >
          {redeemInviteCode.isPending && (
            <Loader2Icon className="size-4 animate-spin" />
          )}
          Redeem code
        </Button>

        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
      </div>

      {notFound && (
        <div className="flex flex-col gap-4">
          <Alert variant="destructive">
            <AlertDescription>
              We couldn&apos;t find that code. Check it, or start a normal
              interview below.
            </AlertDescription>
          </Alert>
          <InterviewForm />
        </div>
      )}
    </div>
  );
};

export const InviteCodeGate = () => {
  const [mode, setMode] = useState<GateMode>("choice");

  if (mode === "code") {
    return <CodeScreen onBack={() => setMode("choice")} />;
  }

  if (mode === "form") {
    return <InterviewForm />;
  }

  return (
    <ChoiceScreen
      onHaveCode={() => setMode("code")}
      onStartNew={() => setMode("form")}
    />
  );
};
