"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/others/utils";

interface RevealProps extends React.ComponentProps<"div"> {
  delayMs?: number;
  from?: "bottom" | "left" | "right";
}

const FROM_CLASSES: Record<NonNullable<RevealProps["from"]>, string> = {
  bottom: "motion-safe:translate-y-6",
  left: "motion-safe:-translate-x-6",
  right: "motion-safe:translate-x-6",
};

export const Reveal = ({
  className,
  delayMs = 0,
  from = "bottom",
  style,
  children,
  ...props
}: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: visible ? `${delayMs}ms` : undefined,
        ...style,
      }}
      className={cn(
        "motion-safe:opacity-0 motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out",
        FROM_CLASSES[from],
        visible &&
          "motion-safe:translate-x-0 motion-safe:translate-y-0 motion-safe:opacity-100",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
