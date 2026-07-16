import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReportCard } from "./reportCard";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.07]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-24 sm:px-6 sm:pt-24 sm:pb-32 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div>
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
            <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 font-mono text-xs text-muted-foreground">
              AI-powered interview practice
            </span>
          </div>

          <h1 className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:delay-100 mt-5 text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
            Practice interviews that actually feel like the real thing
          </h1>

          <p className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:delay-200 mt-5 max-w-lg text-lg text-pretty text-muted-foreground">
            Run timed coding, system design, and behavioral interviews against
            an AI interviewer, get a scored report with a real verdict, and
            track your progress until you're ready.
          </p>

          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:delay-300 mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="group/cta"
              render={<Link href="/signup" />}
              nativeButton={false}
            >
              Start practicing free
              <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="#how-it-works" />}
              nativeButton={false}
            >
              <PlayCircle className="size-4" />
              See how it works
            </Button>
          </div>

          <p className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700 motion-safe:delay-500 mt-4 text-xs text-muted-foreground">
            2 free interviews and 2 free practice attempts to start. No credit
            card required.
          </p>
        </div>

        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-700 motion-safe:delay-300 flex justify-center lg:justify-end">
          <ReportCard />
        </div>
      </div>
    </section>
  );
};
