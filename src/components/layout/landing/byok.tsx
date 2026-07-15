import { KeyRound, ShieldCheck } from "lucide-react";
import { Reveal } from "./reveal";

export const Byok = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <div className="grid gap-8 rounded-3xl border border-primary/20 bg-primary/5 p-8 sm:grid-cols-[auto_1fr] sm:items-center sm:p-10">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <KeyRound className="size-6" />
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Bring your own Gemini key, if you'd rather
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Add your own Gemini API key in Settings and every AI feature -
              interview generation, hints, resume feedback, reports - runs on
              it. It's kept in your browser and sent with each request. We don't
              store it on our servers.
            </p>
            <p className="mt-3 flex items-center gap-1.5 font-mono text-xs text-primary">
              <ShieldCheck className="size-3.5" />
              Never persisted server-side
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
