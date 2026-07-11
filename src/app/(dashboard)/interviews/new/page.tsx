import { requireAuth } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { InterviewForm } from "@/features/dashboard/interviews/components/interviewForm";

const Page = async () => {
  await requireAuth();

  return (
    <div className="p-4 md:px-10 md:py-6">
      <div className="mx-auto max-w-screen-md w-full flex flex-col gap-y-6">
        <div className="flex items-center gap-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-muted-foreground"
            render={<Link href="/interviews" />}
            nativeButton={false}
          >
            <ChevronLeft className="size-4 mr-1" />
            Back to Interviews
          </Button>
        </div>

        <div className="flex flex-col gap-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Start a new interview
          </h1>
          <p className="text-muted-foreground text-sm">
            Select your preferences to generate a custom AI interview session.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <InterviewForm />
        </div>
      </div>
    </div>
  );
};

export default Page;
