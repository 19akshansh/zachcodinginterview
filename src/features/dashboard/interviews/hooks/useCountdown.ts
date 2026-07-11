import { useEffect, useRef, useState } from "react";

interface UseCountdownParams {
  startedAt: string | Date | null;
  timeLimitMinutes: number;
  onExpire?: () => void;
}

const getRemainingMs = (
  startedAt: string | Date | null,
  timeLimitMinutes: number,
) => {
  if (!startedAt) return timeLimitMinutes * 60_000;
  const deadline = new Date(startedAt).getTime() + timeLimitMinutes * 60_000;
  return deadline - Date.now();
};

export const useCountdown = ({
  startedAt,
  timeLimitMinutes,
  onExpire,
}: UseCountdownParams) => {
  const [remainingMs, setRemainingMs] = useState(() =>
    getRemainingMs(startedAt, timeLimitMinutes),
  );
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    hasExpiredRef.current = false;
    setRemainingMs(getRemainingMs(startedAt, timeLimitMinutes));

    const interval = setInterval(() => {
      const next = getRemainingMs(startedAt, timeLimitMinutes);
      setRemainingMs(next);

      if (next <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, timeLimitMinutes]);

  const clamped = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(clamped / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const label = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const percentRemaining = Math.min(
    100,
    Math.max(0, (clamped / (timeLimitMinutes * 60_000)) * 100),
  );

  return {
    remainingMs: clamped,
    label,
    isExpired: clamped <= 0,
    isLow: percentRemaining <= 15,
    percentRemaining,
  };
};
