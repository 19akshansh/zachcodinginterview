"use client";

import { useState } from "react";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ApplicationStatus, UserRole } from "@/config/enums";
import { RECRUITER_APPLICATION } from "@/config/constants";
import {
  useApplyToBeRecruiter,
  useMyApplication,
} from "@/features/dashboard/recruiters/hooks/useRecruiters";
import { useSuspenseMe } from "../hooks/useSettings";

const ApplyForm = ({
  rejectedNote,
}: {
  rejectedNote?: { reviewNote: string | null } | null;
}) => {
  const [description, setDescription] = useState("");
  const applyToBeRecruiter = useApplyToBeRecruiter();

  const trimmedLength = description.trim().length;
  const isTooShort =
    trimmedLength < RECRUITER_APPLICATION.MIN_DESCRIPTION_LENGTH;

  const handleSubmit = () => {
    if (isTooShort) return;

    applyToBeRecruiter.mutate(
      { description: description.trim() },
      {
        onSuccess: () => setDescription(""),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {rejectedNote ? "Apply again" : "Become a recruiter"}
        </CardTitle>
        <CardDescription>
          Author your own interview questions, invite candidates by code, and
          review their results.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Label htmlFor="recruiter-application">
          Tell us who you are and why you're applying
        </Label>
        <Textarea
          id="recruiter-application"
          placeholder="Company, role, and what you're hiring for..."
          rows={5}
          value={description}
          disabled={applyToBeRecruiter.isPending}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {trimmedLength}/{RECRUITER_APPLICATION.MIN_DESCRIPTION_LENGTH}{" "}
          characters minimum
        </p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          type="button"
          size="sm"
          disabled={isTooShort || applyToBeRecruiter.isPending}
          onClick={handleSubmit}
        >
          {applyToBeRecruiter.isPending && (
            <Loader2Icon className="size-4 animate-spin" />
          )}
          Apply
        </Button>
      </CardFooter>
    </Card>
  );
};

export const RecruiterTab = () => {
  const { data: me } = useSuspenseMe();
  const { data: application } = useMyApplication();

  const hasRecruiterAccess =
    me.role === UserRole.RECRUITER || me.role === UserRole.ADMIN;

  if (hasRecruiterAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recruiter access</CardTitle>
          <CardDescription>
            You can author questions, invite candidates, and review results from
            the recruiter portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Item variant="outline">
            <ItemMedia variant="icon" className="text-primary">
              <CheckCircle2Icon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>You have recruiter access</ItemTitle>
              <ItemDescription>
                Head to the recruiter portal to get started.
              </ItemDescription>
            </ItemContent>
          </Item>

          {application && (
            <div className="mt-4 rounded-2xl border border-border px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Your original application
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {application.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (application && application.status === ApplicationStatus.PENDING) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Become a recruiter</CardTitle>
          <CardDescription>
            Author your own interview questions, invite candidates by code, and
            review their results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Item variant="outline">
            <ItemMedia variant="icon">
              <ClockIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Application submitted</ItemTitle>
              <ItemDescription>
                We'll email you once it's reviewed.
              </ItemDescription>
            </ItemContent>
          </Item>

          <div className="mt-4 rounded-2xl border border-border px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Your application
            </p>
            <p className="text-sm whitespace-pre-wrap">
              {application.description}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rejectedApplication =
    application && application.status === ApplicationStatus.REJECTED
      ? application
      : null;

  return (
    <div className="flex flex-col gap-4">
      {rejectedApplication && (
        <Alert variant="destructive">
          <XCircleIcon />
          <AlertTitle>Your last application wasn't approved</AlertTitle>
          <AlertDescription>
            {rejectedApplication.reviewNote ||
              "You're welcome to apply again with more detail."}
          </AlertDescription>
        </Alert>
      )}
      <ApplyForm
        rejectedNote={
          rejectedApplication
            ? { reviewNote: rejectedApplication.reviewNote }
            : undefined
        }
      />
    </div>
  );
};
