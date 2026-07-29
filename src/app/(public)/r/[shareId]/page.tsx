import { notFound } from "next/navigation";
import { PublicReportView } from "@/features/dashboard/reports/components/publicReportView";
import { getQueryClient, trpc } from "@/trpc/server";

interface PageProps {
  params: Promise<{ shareId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { shareId } = await params;

  try {
    const report = await getQueryClient().fetchQuery(
      trpc.reports.getByShareId.queryOptions({ shareId }),
    );

    return <PublicReportView report={report} />;
  } catch (error: any) {
    if (error?.data?.code === "NOT_FOUND") notFound();
    throw error;
  }
};

export default Page;
