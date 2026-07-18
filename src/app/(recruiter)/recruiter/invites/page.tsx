import { ErrorBoundary } from "react-error-boundary";
import { requireRecruiter } from "@/lib/auth/utils";
import { HydrateClient } from "@/trpc/server";
import { InviteForm } from "@/features/dashboard/recruiters/components/inviteForm";
import {
  InvitesError,
  InvitesTable,
} from "@/features/dashboard/recruiters/components/inviteList";
import { recruiterInvitesParamsLoader } from "@/features/dashboard/recruiters/server/paramsLoader";
import { prefetchRecruitersInvited } from "@/features/dashboard/recruiters/server/prefetch";

type InvitesPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    status?: string;
  }>;
};

const Page = async (props: InvitesPageProps) => {
  await requireRecruiter();
  const { page, pageSize, status } = await recruiterInvitesParamsLoader(
    props.searchParams,
  );

  try {
    await prefetchRecruitersInvited({
      page,
      pageSize,
      status: status ?? undefined,
    });
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <div className="p-4 md:px-10 md:py-6 h-full max-w-[100vw] overflow-x-hidden">
        <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-semibold">Invites</h1>
            <p className="text-sm text-muted-foreground">
              Invite candidates by code and track who&apos;s redeemed.
            </p>
          </div>

          <div className="max-w-2xl">
            <InviteForm />
          </div>

          <ErrorBoundary fallback={<InvitesError />}>
            <InvitesTable />
          </ErrorBoundary>
        </div>
      </div>
    </HydrateClient>
  );
};

export default Page;
