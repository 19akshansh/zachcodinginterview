"use client";

import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProfile } from "../hooks/useProfile";

interface ProfileDetailsProps {
  name: string;
  bio: string | null;
}

export const ProfileDetails = ({ name, bio }: ProfileDetailsProps) => {
  const [draftName, setDraftName] = useState(name);
  const [draftBio, setDraftBio] = useState(bio ?? "");
  const updateProfile = useUpdateProfile();

  const isDirty = draftName !== name || draftBio !== (bio ?? "");
  const isNameValid = draftName.trim().length >= 2;

  const handleSave = () => {
    if (!isDirty || !isNameValid) return;

    updateProfile.mutate({
      name: draftName.trim(),
      bio: draftBio.trim(),
    });
  };

  const handleReset = () => {
    setDraftName(name);
    setDraftBio(bio ?? "");
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="username"
          maxLength={100}
          className="h-11 text-base font-medium"
          aria-invalid={!isNameValid}
        />
        {!isNameValid && (
          <p className="px-1 text-xs text-destructive">
            Name must be at least 2 characters.
          </p>
        )}
      </div>

      <Textarea
        value={draftBio}
        onChange={(e) => setDraftBio(e.target.value)}
        placeholder="bio"
        maxLength={500}
        className="min-h-24 text-base"
      />

      <div className="flex items-center justify-between">
        <p className="px-1 text-xs text-muted-foreground">
          {draftBio.length}/500
        </p>

        {isDirty && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={updateProfile.isPending}
              onClick={handleReset}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!isNameValid || updateProfile.isPending}
              onClick={handleSave}
            >
              {updateProfile.isPending && (
                <Loader2Icon className="size-3.5 animate-spin" />
              )}
              Save changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
