"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";

export const InterviewAbandonedScreen = () => {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="max-w-lg w-full p-8 text-center space-y-6">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
          <XCircle className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold">This interview was abandoned</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No report was generated for this session. Start a new interview
            whenever you're ready to try again.
          </p>
        </div>
        <Button
          size="lg"
          className="w-full font-bold"
          render={<Link href="/interviews/new">Start a new interview</Link>}
        />
        <Button
          variant="outline"
          className="w-full"
          render={<Link href="/interviews">Back to interviews</Link>}
        />
      </Card>
    </div>
  );
};
