"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GeminiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GeminiKeyModal = ({ open, onOpenChange }: GeminiKeyModalProps) => {
  const router = useRouter();

  const handleAddKey = () => {
    router.push("/settings?tab=api-keys");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add your Gemini API key</AlertDialogTitle>
          <AlertDialogDescription>
            AI features like hints, grading, and resume feedback run on your own
            Gemini API key. Add one in Settings to keep using them - it's stored
            only in this browser and never touches our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAddKey}>
            Add Gemini Key
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
