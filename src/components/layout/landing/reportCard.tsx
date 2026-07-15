"use client";

import { CheckCircle2, CircleDot } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/others/utils";

const TEST_CASES = [
  "handles the empty array",
  "handles duplicate keys",
  "runs in O(n) time",
  "handles negative values",
];

export const ReportCard = () => {
  const [stage, setStage] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) =>
      timeouts.push(setTimeout(fn, ms));

    const run = () => {
      setStage(0);
      setScore(0);
      TEST_CASES.forEach((_, i) => {
        schedule(() => setStage(i + 1), 500 + i * 450);
      });
      schedule(
        () => setStage(TEST_CASES.length + 1),
        500 + TEST_CASES.length * 450 + 300,
      );
      schedule(
        () => setStage(TEST_CASES.length + 2),
        500 + TEST_CASES.length * 450 + 1400,
      );
    };

    run();
    const loop = setInterval(run, 9000);
    return () => {
      clearInterval(loop);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (stage !== TEST_CASES.length + 1) return;
    const target = 94;
    const step = Math.ceil(target / 20);
    const interval = setInterval(() => {
      setScore((prev) => {
        const next = prev + step;
        if (next >= target) {
          clearInterval(interval);
          return target;
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [stage]);

  const verdictShown = stage >= TEST_CASES.length + 2;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/20 blur-3xl"
      />
      <div className="w-[320px] rotate-2 rounded-3xl border border-border bg-card p-4 shadow-2xl shadow-primary/10 ring-1 ring-foreground/5 transition-transform duration-500 hover:rotate-0 sm:w-[360px]">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive/60" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-primary/60" />
          </div>
          <span className="font-mono text-[10px] tracking-wide text-muted-foreground">
            interview_report.ts
          </span>
        </div>

        <div className="mt-3 space-y-1 font-mono text-[11px] leading-relaxed">
          <p className="text-muted-foreground">
            <span className="text-primary">Q:</span> Group anagrams from a list
            of strings
          </p>
          <p>
            <span className="text-primary">function</span>{" "}
            <span className="text-foreground">groupAnagrams</span>
            <span className="text-muted-foreground">(words) {"{"}</span>
          </p>
          <p className="pl-3 text-muted-foreground">
            <span className="text-primary">const</span> map = new Map()
          </p>
          <p className="pl-3 text-muted-foreground">
            <span className="text-primary">return</span> [...map.values()]
          </p>
          <p className="text-muted-foreground">{"}"}</p>
        </div>

        <div className="mt-4 space-y-1.5 border-t border-border pt-3">
          {TEST_CASES.map((label, i) => {
            const done = stage > i;
            return (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-2 text-[11px] transition-all duration-300",
                  done
                    ? "translate-x-0 opacity-100"
                    : "translate-x-1 opacity-40",
                )}
              >
                {done ? (
                  <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                ) : (
                  <CircleDot className="size-3.5 shrink-0 text-muted-foreground" />
                )}
                <span className="font-mono text-muted-foreground">{label}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div>
            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
              Overall score
            </p>
            <p className="font-mono text-2xl font-semibold text-foreground">
              {score}
              <span className="text-sm text-muted-foreground">/100</span>
            </p>
          </div>

          <div
            className={cn(
              "rounded-full border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-all duration-500",
              verdictShown
                ? "rotate-0 scale-100 opacity-100"
                : "rotate-6 scale-75 opacity-0",
            )}
          >
            Strong Hire
          </div>
        </div>
      </div>
    </div>
  );
};
