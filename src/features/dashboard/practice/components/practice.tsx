"use client";

import React from "react";
import Link from "next/link";
import {
  EntityHeader,
  EntityContainer,
  EntitySearch,
  EntityPagination,
  LoadingView,
  ErrorView,
  EmptyView,
  EntityList,
} from "@/components/layout/shared/entityComponents";
import { useSuspensePractice } from "../hooks/usePractice";
import { usePracticeParams } from "../hooks/usePracticeParams";
import { useEntitySearch } from "@/hooks/useEntitySearch";
import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/others/utils";
import {
  interviewTypeOptions,
  difficultyOptions,
  seniorityOptions,
  companyTierOptions,
} from "../../interviews/types/typeOptions";
import { PRACTICE_TYPES } from "@/config/enums";

type PracticeQueryResult = ReturnType<typeof useSuspensePractice>;

const PRACTICE_TYPE_OPTIONS = interviewTypeOptions.filter((opt) =>
  (PRACTICE_TYPES as readonly string[]).includes(opt.value),
);

export const PracticeHeader = () => {
  return (
    <EntityHeader
      title="Practice"
      description="Browse the question bank and attempt any question on your own, at your own pace"
    />
  );
};

export const PracticeSearch = () => {
  const [params, setParams] = usePracticeParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search questions..."
    />
  );
};

export const PracticeFilters = () => {
  const [params, setParams] = usePracticeParams();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setParams({ ...params, type: null, page: 1 })}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
            !params.type
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border text-muted-foreground hover:border-primary/50",
          )}
        >
          All
        </button>
        {PRACTICE_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              setParams({ ...params, type: opt.value as any, page: 1 })
            }
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
              params.type === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/50",
            )}
          >
            <opt.icon className="size-3.5" />
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setParams({ ...params, difficulty: null, page: 1 })}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
              !params.difficulty
                ? "bg-secondary text-secondary-foreground border-secondary"
                : "bg-background border-border text-muted-foreground hover:border-secondary/50",
            )}
          >
            Any difficulty
          </button>
          {difficultyOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setParams({ ...params, difficulty: opt.value, page: 1 })
              }
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
                params.difficulty === opt.value
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "bg-background border-border text-muted-foreground hover:border-secondary/50",
              )}
            >
              <opt.icon className="size-3" />
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setParams({ ...params, seniorityLevel: null, page: 1 })
            }
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
              !params.seniorityLevel
                ? "bg-secondary text-secondary-foreground border-secondary"
                : "bg-background border-border text-muted-foreground hover:border-secondary/50",
            )}
          >
            Any seniority
          </button>
          {seniorityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setParams({ ...params, seniorityLevel: opt.value, page: 1 })
              }
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
                params.seniorityLevel === opt.value
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "bg-background border-border text-muted-foreground hover:border-secondary/50",
              )}
            >
              <opt.icon className="size-3" />
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setParams({ ...params, companyTier: null, page: 1 })}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
              !params.companyTier
                ? "bg-secondary text-secondary-foreground border-secondary"
                : "bg-background border-border text-muted-foreground hover:border-secondary/50",
            )}
          >
            Any company tier
          </button>
          {companyTierOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setParams({ ...params, companyTier: opt.value, page: 1 })
              }
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
                params.companyTier === opt.value
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "bg-background border-border text-muted-foreground hover:border-secondary/50",
              )}
            >
              <opt.icon className="size-3" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PracticePagination = ({
  practice,
}: {
  practice: PracticeQueryResult;
}) => {
  const [params, setParams] = usePracticeParams();

  return (
    <EntityPagination
      disabled={practice.isFetching}
      totalPages={practice.data.totalPages}
      page={practice.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

const RESULT_STYLES: Record<string, string> = {
  PASSED: "bg-green-500/10 text-green-600 border-green-500/20",
  PARTIAL: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  FAILED: "bg-destructive/10 text-destructive border-destructive/20",
  ERROR: "bg-destructive/10 text-destructive border-destructive/20",
  TIMEOUT: "bg-destructive/10 text-destructive border-destructive/20",
};

export const PracticeItem = ({
  data,
}: {
  data: PracticeQueryResult["data"]["items"][number];
}) => {
  const typeMeta = PRACTICE_TYPE_OPTIONS.find((o) => o.value === data.type);
  const attemptResult = data.attempt?.result;

  const card = (
    <Card
      className={cn(
        "p-4 shadow-none transition-shadow",
        data.locked ? "opacity-60" : "hover:shadow cursor-pointer",
      )}
    >
      <CardContent className="flex items-center justify-between gap-4 p-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            {data.locked ? (
              <Lock className="size-4 text-muted-foreground" />
            ) : typeMeta ? (
              <typeMeta.icon className="size-5 text-primary" />
            ) : null}
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base font-medium truncate">
              {data.title}
            </CardTitle>
            <CardDescription className="text-xs flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                {data.difficulty}
              </Badge>
              {typeMeta && <span>{typeMeta.label}</span>}
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {data.locked ? (
            <Badge
              variant="outline"
              className="text-[10px] font-bold uppercase gap-1"
            >
              <Sparkles className="size-3" />
              PRO
            </Badge>
          ) : attemptResult ? (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase gap-1",
                RESULT_STYLES[attemptResult],
              )}
            >
              {attemptResult === "PASSED" && (
                <CheckCircle2 className="size-3" />
              )}
              {attemptResult === "PASSED" ? "Solved" : attemptResult}
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  if (data.locked) {
    return (
      <Link href="/settings/billing" className="block">
        {card}
      </Link>
    );
  }

  return (
    <Link href={`/practice/${data.id}`} className="block">
      {card}
    </Link>
  );
};

export const PracticeList = ({
  practice,
}: {
  practice: PracticeQueryResult;
}) => {
  return (
    <EntityList
      items={practice.data.items}
      getKey={(item) => item.id}
      renderItem={(item) => <PracticeItem data={item} />}
      emptyView={<PracticeEmpty />}
    />
  );
};

const PracticeData = () => {
  const practice = useSuspensePractice();

  return (
    <EntityContainer
      header={<PracticeHeader />}
      search={
        <div className="flex flex-col gap-3">
          <PracticeSearch />
          <PracticeFilters />
        </div>
      }
      pagination={<PracticePagination practice={practice} />}
    >
      <PracticeList practice={practice} />
    </EntityContainer>
  );
};

export const PracticeContainer = () => {
  return (
    <React.Suspense fallback={<PracticeLoading />}>
      <PracticeData />
    </React.Suspense>
  );
};

export const PracticeLoading = () => (
  <LoadingView message="Loading the question bank..." />
);

export const PracticeError = () => (
  <ErrorView message="Failed to load practice questions. Please try again." />
);

export const PracticeEmpty = () => (
  <EmptyView entity="questions" msg="No questions match these filters." />
);
