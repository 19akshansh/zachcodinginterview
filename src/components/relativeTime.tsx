"use client";

import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

export function RelativeTime({ date }: { date: Date | string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="text-muted-foreground">...</span>;
  }

  return (
    <>
      {formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })}
    </>
  );
}
