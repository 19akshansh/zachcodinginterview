"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";
import { useGeminiKey } from "@/hooks/useGeminiKey";
import { cn } from "@/lib/others/utils";

interface GeminiKeyNoticeProps {
  className?: string;
  message?: string;
}

export const GeminiKeyNotice = ({
  className,
  message = "Add a Gemini API key to use AI features.",
}: GeminiKeyNoticeProps) => {
  const { apiKey, isLoaded } = useGeminiKey();

  if (!isLoaded || apiKey) return null;

  return (
    <Link
      href="/settings?tab=api-keys"
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors w-fit",
        className,
      )}
    >
      <KeyRound className="size-3.5 shrink-0" />
      {message}
    </Link>
  );
};
