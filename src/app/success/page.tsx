import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-background p-4">
      <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-primary/80 blur opacity-20 animate-pulse"></div>
            <div className="relative rounded-full bg-black border border-white/10 p-4 shadow-2xl">
              <CheckCircle2 className="w-12 h-12 text-primary/80" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white">
            You're all set!
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary/70 text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3" />
            Beta Access Granted
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-[350px] mx-auto leading-relaxed">
            Payments are coming soon. You can use all PRO features for free
            during our beta - no money will be deducted from your account.
          </p>
        </div>

        <div className="pt-6">
          <Button
            render={<Link href="/" prefetch />}
            nativeButton={false}
            size="lg"
            className="w-full h-12 text-base bg-primary hover:bg-primary/80 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            Enter Zach Coding Interview <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="mt-4 text-[11px] text-muted-foreground/50 uppercase tracking-widest font-medium">
            Redirecting to dashboard...
          </p>
        </div>
      </div>

      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}
