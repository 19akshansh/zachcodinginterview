"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon, KeyRoundIcon, TrashIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useGeminiKey } from "@/hooks/useGeminiKey";

export const ApiKeysTab = () => {
  const { apiKey, isLoaded, saveKey, clearKey } = useGeminiKey();
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [editing, setEditing] = useState(false);

  const hasKey = isLoaded && !!apiKey;
  const showForm = editing || !hasKey;

  const maskedKey = apiKey
    ? `${apiKey.slice(0, 4)}${"•".repeat(Math.max(apiKey.length - 8, 4))}${apiKey.slice(-4)}`
    : "";

  const handleSave = () => {
    saveKey(draft);
    setDraft("");
    setEditing(false);
    setRevealed(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gemini API key</CardTitle>
        <CardDescription>
          Bring your own Gemini key to use for AI features in this browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {hasKey && !showForm ? (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <KeyRoundIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate font-mono text-sm">
                {revealed ? apiKey : maskedKey}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setRevealed((r) => !r)}
              >
                {revealed ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDraft(apiKey ?? "");
                  setEditing(true);
                }}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={clearKey}
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label htmlFor="gemini-api-key">API key</Label>
            <InputGroup>
              <InputGroupInput
                id="gemini-api-key"
                type={revealed ? "text" : "password"}
                placeholder="AIza..."
                autoComplete="off"
                spellCheck={false}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton onClick={() => setRevealed((r) => !r)}>
                  {revealed ? (
                    <EyeOffIcon className="size-3.5" />
                  ) : (
                    <EyeIcon className="size-3.5" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        )}
      </CardContent>
      {showForm && (
        <CardFooter className="justify-end gap-2">
          {hasKey && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(false);
                setDraft("");
                setRevealed(false);
              }}
            >
              Cancel
            </Button>
          )}
          <Button type="button" size="sm" onClick={handleSave}>
            Save key
          </Button>
        </CardFooter>
      )}
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">
          Your key is stored only in this browser's local storage. It's never
          sent to or stored on our servers.
        </p>
      </CardContent>
    </Card>
  );
};
