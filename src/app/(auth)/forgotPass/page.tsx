import { ForgotPassForm } from "@/features/auth/components/forgotPassForm";
import { requireUnAuth } from "@/lib/authUtils";

const Page = async () => {
  await requireUnAuth();

  return <ForgotPassForm />;
};

export default Page;
