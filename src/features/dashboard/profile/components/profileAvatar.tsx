"use client";

import { CameraIcon, Loader2Icon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AVATAR } from "@/config/constants";
import { cn } from "@/lib/others/utils";
import {
  fileToBase64,
  useRemoveAvatar,
  useUploadAvatar,
} from "../hooks/useProfile";

const ACCEPT = AVATAR.ALLOWED_EXTENSIONS.map((ext) =>
  ext === ".svg"
    ? "image/svg+xml"
    : ext === ".jpg"
      ? "image/jpeg"
      : `image/${ext.slice(1)}`,
).join(",");

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

interface ProfileAvatarProps {
  name: string;
  image: string | null;
}

export const ProfileAvatar = ({ name, image }: ProfileAvatarProps) => {
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isBusy = uploadAvatar.isPending || removeAvatar.isPending;

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;

    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!AVATAR.ALLOWED_EXTENSIONS.includes(extension)) {
      toast.error("Only PNG, JPG, and SVG images are accepted.");
      return;
    }

    if (file.size > AVATAR.MAX_FILE_SIZE_BYTES) {
      toast.error(
        `File is too large. Max size is ${AVATAR.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`,
      );
      return;
    }

    try {
      const fileBase64 = await fileToBase64(file);
      uploadAvatar.mutate({ fileName: file.name, fileBase64 });
    } catch {
      toast.error("Could not read the selected file.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isBusy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "group relative size-28 cursor-pointer rounded-full border-2 border-dashed transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-primary/30",
          isBusy && "pointer-events-none opacity-60",
        )}
      >
        <Avatar className="size-full">
          {image && <AvatarImage src={image} alt={name} />}
          <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-background/80 text-center opacity-0 transition-opacity group-hover:opacity-100",
            (isDragging || isBusy) && "opacity-100",
          )}
        >
          {isBusy ? (
            <Loader2Icon className="size-5 animate-spin text-primary" />
          ) : (
            <>
              <CameraIcon className="size-5 text-primary" />
              <span className="px-2 text-[10px] font-medium leading-tight text-primary">
                upload avatar
                <br />
                (PNG, jpg, svg)
              </span>
            </>
          )}
        </div>

        {image && !isBusy && (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute -top-1 -right-1 size-6 rounded-full shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              removeAvatar.mutate();
            }}
          >
            <XIcon className="size-3" />
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
};
