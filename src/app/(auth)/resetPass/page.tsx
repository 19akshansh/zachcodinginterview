import { ResetPassForm } from "@/features/auth/components/resetPassForm";
import { requireUnAuth } from "@/lib/authUtils";

const Page = async () => {
  await requireUnAuth();

  return <ResetPassForm />;
};

export default Page;
