import {
  Code2,
  FileBarChart,
  FileText,
  Flame,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/others/utils";
import { Reveal } from "./reveal";

const INTERVIEW_TYPES = [
  "Coding",
  "System Design",
  "Behavioral",
  "Resume-Based",
  "Domain-Specific",
];

const LANGUAGES = [
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "C++",
  "Go",
  "Rust",
];

const cardBase =
  "flex flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 sm:p-7";

export const Features = () => {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="max-w-xl">
        <span className="font-mono text-xs tracking-wide text-primary uppercase">
          What you get
        </span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Everything an interview loop actually tests
        </h2>
        <p className="mt-3 text-muted-foreground">
          Not just LeetCode with a timer. A full loop - code, design,
          communication, and the paperwork - with feedback that tells you where
          you actually stand.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
        <Reveal from="left" className="lg:col-span-2 lg:row-span-2">
          <Card className={cn(cardBase, "h-full bg-primary/5 ring-primary/10")}>
            <div>
              <MessagesSquare className="size-6 text-primary" />
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                Five interview types, one AI interviewer
              </h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Run Coding, System Design, Behavioral, Resume-Based, or
                Domain-Specific interviews. Set the difficulty, the seniority
                level you're aiming for, and the company tier - from startup to
                FAANG - so the questions match the bar you're actually trying to
                clear. Prefer something lower-pressure? Practice mode gives you
                the same question types, untimed, for drilling on demand.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {INTERVIEW_TYPES.map((type) => (
                <Badge key={type} variant="outline" className="bg-background">
                  {type}
                </Badge>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delayMs={100}>
          <Card className={cardBase}>
            <div>
              <Code2 className="size-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Real code, real test cases
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Coding questions run against actual test cases in a sandboxed
                judge. Stuck? Hints are there when you need them.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {LANGUAGES.map((lang) => (
                <Badge
                  key={lang}
                  variant="secondary"
                  className="font-mono text-[10px]"
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delayMs={200}>
          <Card className={cardBase}>
            <div>
              <FileBarChart className="size-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                A scored report, not a vibe
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Every interview ends with a breakdown across communication,
                problem solving, and code quality - plus an overall verdict from
                Strong Hire to Strong No Hire, exportable as a PDF.
              </p>
            </div>
          </Card>
        </Reveal>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Reveal delayMs={100} from="left">
          <Card className={cn(cardBase, "h-full")}>
            <div className="flex items-start gap-4">
              <FileText className="size-6 shrink-0 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Feedback on the resume, too
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload a PDF resume and get direct AI feedback on it - before
                  it's the thing standing between you and an interview.
                </p>
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal delayMs={200} from="right">
          <Card className={cn(cardBase, "h-full")}>
            <div className="flex items-start gap-4">
              <Flame className="size-6 shrink-0 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  A calendar that keeps you honest
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  A GitHub-style activity calendar tracks every practice session
                  and interview, with a weekly summary on your dashboard so
                  momentum is visible, not just felt.
                </p>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal delayMs={100} className="mt-4">
        <Card
          className={cn(cardBase, "flex-row items-center gap-4 bg-muted/40")}
        >
          <Sparkles className="size-6 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Every AI feature above - question generation, hints, feedback,
            reports - runs however you've set it up in Settings, including on
            your own API key if you'd rather bring one.
          </p>
        </Card>
      </Reveal>
    </section>
  );
};
