import { notFound } from "next/navigation";
import { UserDetail } from "@/features/dashboard/users/components/userDetails";
import { requireAuth } from "@/lib/auth/utils";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  await requireAuth();

  try {
    await getQueryClient().fetchQuery(
      trpc.users.getById.queryOptions({ userId: id }),
    );
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
      <UserDetail userId={id} />
    </HydrateClient>
  );
};

export default Page;
