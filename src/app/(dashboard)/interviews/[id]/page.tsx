import { InterviewDetailsClient } from "@/features/dashboard/interviews/components/interviewDetailsClient";
import { requireAuth } from "@/lib/authUtils";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  await requireAuth();

  try {
    await getQueryClient().fetchQuery(
      trpc.interviews.getOne.queryOptions({ id }),
    );
  } catch (error: any) {
    if (error?.data?.code === "NOT_FOUND") notFound();
    throw error;
  }

  return (
    <HydrateClient>
      <InterviewDetailsClient interviewId={id} />
    </HydrateClient>
  );
};

export default Page;
