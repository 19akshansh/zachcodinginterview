import { notFound } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import { requireAuth } from "@/lib/auth/utils";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";
import {
  PracticeSession,
  PracticeLocked,
  PracticeSessionError,
} from "@/features/dashboard/practice/components/practiceSession";
import { ProgrammingLanguage } from "@/config/enums";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  await requireAuth();

  try {
    await getQueryClient().fetchQuery(
      trpc.practice.getOne.queryOptions({ id }),
    );
  } catch (error: any) {
    if (error?.data?.code === "NOT_FOUND") notFound();
    if (error?.data?.code === "FORBIDDEN") return <PracticeLocked />;
    throw error;
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<PracticeSessionError />}>
        <PracticeSession id={id} defaultLanguage={ProgrammingLanguage.PYTHON} />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
