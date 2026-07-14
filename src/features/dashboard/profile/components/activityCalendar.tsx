"use client";

import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ActivityDay } from "@/helpers/activity";
import { cn } from "@/lib/others/utils";
import { useSuspenseMyActivity } from "../hooks/useProfile";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const VISIBLE_WEEKDAY_ROWS = new Set([1, 3, 5]); // Mon, Wed, Fri

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const LEVEL_CLASSES: Record<ActivityDay["level"], string> = {
  0: "bg-muted ring-1 ring-inset ring-border/60",
  1: "bg-primary/20",
  2: "bg-primary/45",
  3: "bg-primary/70",
  4: "bg-primary",
};

type Column = ActivityDay[];

const buildColumns = (days: ActivityDay[]): Column[] => {
  const columns: Column[] = [];
  for (let i = 0; i < days.length; i += 7) {
    columns.push(days.slice(i, i + 7));
  }
  return columns;
};

const buildMonthLabels = (columns: Column[]) => {
  const labels: { index: number; label: string }[] = [];
  let lastMonth = -1;

  columns.forEach((column, index) => {
    const firstDay = column[0];
    if (!firstDay) return;

    const month = parseISO(firstDay.date).getMonth();
    if (month !== lastMonth) {
      labels.push({ index, label: MONTH_LABELS[month] });
      lastMonth = month;
    }
  });

  return labels;
};

const formatTooltipDate = (dateStr: string) =>
  format(parseISO(dateStr), "MMM d, yyyy");

const ActivityCell = ({ day }: { day: ActivityDay }) => (
  <Tooltip>
    <TooltipTrigger
      render={
        <div
          className={cn(
            "size-3 rounded-[3px] transition-transform hover:scale-125",
            LEVEL_CLASSES[day.level],
          )}
        />
      }
    />
    <TooltipContent>
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{formatTooltipDate(day.date)}</span>
        <span className="text-background/70">
          {day.count === 0
            ? "No activity"
            : `${day.practiceCount} practice \u00b7 ${day.interviewCount} interview${
                day.interviewCount === 1 ? "" : "s"
              }`}
        </span>
      </div>
    </TooltipContent>
  </Tooltip>
);

export const ActivityCalendar = () => {
  const { data } = useSuspenseMyActivity();

  const columns = useMemo(() => buildColumns(data.days), [data.days]);
  const monthLabels = useMemo(() => buildMonthLabels(columns), [columns]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Activity overview
        </h2>
        <p className="text-xs text-muted-foreground">
          {data.totalPractice} practice sessions &bull; {data.totalInterviews}{" "}
          interviews in the last year
        </p>
      </div>

      <TooltipProvider>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card/50 p-4">
          <div className="inline-flex flex-col gap-2 min-w-max">
            <div
              className="grid text-[10px] text-muted-foreground"
              style={{
                gridTemplateColumns: `24px repeat(${columns.length}, 12px)`,
                columnGap: "4px",
              }}
            >
              <span />
              {columns.map((column, index) => {
                const monthLabel = monthLabels.find(
                  (m) => m.index === index,
                )?.label;
                return (
                  <span
                    key={`month-${column[0]?.date ?? index}`}
                    className="whitespace-nowrap"
                  >
                    {monthLabel ?? ""}
                  </span>
                );
              })}
            </div>

            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `24px repeat(${columns.length}, 12px)`,
                gridTemplateRows: "repeat(7, 12px)",
                gridAutoFlow: "column",
                columnGap: "4px",
                rowGap: "4px",
              }}
            >
              {WEEKDAY_LABELS.map((label, row) => (
                <span
                  key={`day-label-${label}`}
                  className="text-[10px] text-muted-foreground leading-3 self-center"
                  style={{ gridColumn: 1, gridRow: row + 1 }}
                >
                  {VISIBLE_WEEKDAY_ROWS.has(row) ? label : ""}
                </span>
              ))}

              {columns.map((column, colIndex) =>
                column.map((day, rowIndex) => (
                  <div
                    key={day.date}
                    style={{
                      gridColumn: colIndex + 2,
                      gridRow: rowIndex + 1,
                    }}
                  >
                    <ActivityCell day={day} />
                  </div>
                )),
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-muted-foreground">
                Learn how we count contributions
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span>Less</span>
                {([0, 1, 2, 3, 4] as const).map((level) => (
                  <div
                    key={level}
                    className={cn("size-3 rounded-[3px]", LEVEL_CLASSES[level])}
                  />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};
