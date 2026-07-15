import { Reveal } from "./reveal";

const STEPS = [
  {
    title: "Sign up",
    description: "Create an account - no credit card needed to get started.",
  },
  {
    title: "Pick a type and difficulty",
    description:
      "Choose an interview type, difficulty, seniority level, and the company tier you're aiming for.",
  },
  {
    title: "Run it",
    description:
      "Answer, write, and run real code against the AI interviewer. Take a hint if you get stuck.",
  },
  {
    title: "Review your report",
    description:
      "Get a scored breakdown and a verdict, then check your activity calendar to see where you're improving.",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="border-y border-border/60 bg-muted/20"
    >
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal className="max-w-xl">
          <span className="font-mono text-xs tracking-wide text-primary uppercase">
            The loop
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            From sign-up to scored report in one sitting
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delayMs={index * 100} className="relative">
              <li className="list-none">
                <span className="font-mono text-3xl font-semibold text-primary/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
};
