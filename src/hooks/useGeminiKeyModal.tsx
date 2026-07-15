import { TRPCClientError } from "@trpc/client";
import { useState } from "react";
import { GeminiKeyModal } from "@/components/layout/shared/geminiKeyModal";

export const useGeminiKeyModal = () => {
  const [open, setOpen] = useState(false);

  const handleError = (error: unknown) => {
    if (error instanceof TRPCClientError) {
      if (error.data?.geminiKeyIssue) {
        setOpen(true);
        return true;
      }
    }
    return false;
  };

  const modal = <GeminiKeyModal open={open} onOpenChange={setOpen} />;

  return { handleError, modal };
};
