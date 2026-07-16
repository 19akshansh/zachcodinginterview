import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Sign in", href: "/signin" },
];

export const CtaFooter = () => {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/10 px-8 py-14 text-center sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.08]"
            />
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Your next interview shouldn't be the first one that matters
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Two free interviews. Two free practice attempts. No credit card.
            </p>
            <Button
              size="lg"
              className="group/cta mt-7"
              render={<Link href="/signup" />}
              nativeButton={false}
            >
              Start practicing free
              <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
            </Button>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-6">
          <Image
            src="/mainAssets/logoFull.svg"
            alt="ZACH Coding Interview"
            width={168}
            height={23}
            className="h-5 w-auto opacity-80"
          />

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ZACH Coding Interview
          </p>
        </div>
      </footer>
    </>
  );
};
