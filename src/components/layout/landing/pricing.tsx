import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/others/utils";
import { Reveal } from "./reveal";

const FREE_FEATURES = [
  "2 interviews total",
  "2 practice attempts total",
  "30 minute interview time limit",
  "Up to 4 questions per interview",
  "25% of the practice question library",
];

const PRO_FEATURES = [
  "Unlimited interviews",
  "Unlimited practice attempts",
  "60 minute interview time limit",
  "Up to 10 questions per interview",
  "100% of the practice question library",
];

export const Pricing = () => {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="max-w-xl">
        <span className="font-mono text-xs tracking-wide text-primary uppercase">
          Pricing
        </span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Start free. Upgrade when the limits get in your way.
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Reveal from="left">
          <Card className="h-full p-2">
            <CardHeader className="px-5 pt-4">
              <span className="text-sm font-medium text-muted-foreground">
                Free
              </span>
              <p className="mt-2 text-3xl font-semibold text-foreground">$0</p>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <ul className="space-y-2.5">
                {FREE_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="mt-6 w-full"
                render={<Link href="/signup" />}
              >
                Start free
              </Button>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal from="right" delayMs={100}>
          <Card className="h-full border-primary/30 bg-primary/5 p-2 ring-1 ring-primary/20">
            <CardHeader className="px-5 pt-4">
              <span className="text-sm font-medium text-primary">Pro</span>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span
                  className="text-3xl font-semibold text-foreground"
                  title="Placeholder - set the real price here"
                >
                  {"10USD"}
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </p>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <ul className="space-y-2.5">
                {PRO_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className={cn(
                      "flex items-start gap-2 text-sm text-foreground",
                    )}
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" render={<Link href="/signup" />}>
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
};
