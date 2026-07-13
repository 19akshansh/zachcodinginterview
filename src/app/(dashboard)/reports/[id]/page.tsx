import { notFound } from "next/navigation";
import { ReportDetailsClient } from "@/features/dashboard/reports/components/reportDetailsClient";
import { requireAuth } from "@/lib/authUtils";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  await requireAuth();

  try {
    await getQueryClient().fetchQuery(trpc.reports.getOne.queryOptions({ id }));
  } catch (error: any) {
    if (
      error?.data?.code === "NOT_FOUND" ||
      error?.data?.code === "FORBIDDEN"
    ) {
      notFound();
    }
    throw error;
  }

  return (
    <HydrateClient>
      <ReportDetailsClient reportId={id} />
    </HydrateClient>
  );
};

export default Page;
