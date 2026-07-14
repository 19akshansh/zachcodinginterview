export interface ActivityDay {
  date: string;
  practiceCount: number;
  interviewCount: number;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function levelFor(count: number): ActivityDay["level"] {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

export function buildActivityCalendar(
  practiceDates: Date[],
  interviewDates: Date[],
  days: number,
): ActivityDay[] {
  const counts = new Map<string, { practice: number; interview: number }>();

  for (const date of practiceDates) {
    const key = toDateKey(date);
    const entry = counts.get(key) ?? { practice: 0, interview: 0 };
    entry.practice += 1;
    counts.set(key, entry);
  }

  for (const date of interviewDates) {
    const key = toDateKey(date);
    const entry = counts.get(key) ?? { practice: 0, interview: 0 };
    entry.interview += 1;
    counts.set(key, entry);
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const result: ActivityDay[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - i);

    const key = toDateKey(day);
    const entry = counts.get(key) ?? { practice: 0, interview: 0 };
    const count = entry.practice + entry.interview;

    result.push({
      date: key,
      practiceCount: entry.practice,
      interviewCount: entry.interview,
      count,
      level: levelFor(count),
    });
  }

  return result;
}
