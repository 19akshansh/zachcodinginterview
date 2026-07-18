import { Briefcase, ClipboardCheck, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export const Recruiters = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <div className="flex flex-col items-start gap-8 rounded-3xl border border-border bg-card p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-lg">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 font-mono text-xs text-muted-foreground">
              <Briefcase className="size-3" />
              For recruiters
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Skip the scheduling. Send the interview.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Invite a candidate by email to a preset interview - pick the type,
              difficulty, and seniority level once - and get a scored report
              back when they're done.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="size-3.5" />
              Invite by email
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ClipboardCheck className="size-3.5" />
              Report lands automatically
            </div>
            <Button
              variant="outline"
              className="mt-1"
              render={<Link href="/signup" />}
              nativeButton={false}
            >
              Invite a candidate
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
