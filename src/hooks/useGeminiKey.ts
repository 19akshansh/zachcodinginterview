"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { STORAGE_KEYS } from "@/config/constants";

export const useGeminiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      setApiKey(localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY));
    } catch {
      setApiKey(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveKey = useCallback((value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      toast.error("Enter a valid API key first.");
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, trimmed);
      setApiKey(trimmed);
      toast.success("Gemini key saved to this browser.");
    } catch {
      toast.error("Couldn't save the key. Please try again.");
    }
  }, []);

  const clearKey = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
      setApiKey(null);
      toast.success("Gemini key removed.");
    } catch {
      toast.error("Couldn't remove the key. Please try again.");
    }
  }, []);

  return { apiKey, isLoaded, saveKey, clearKey };
};
