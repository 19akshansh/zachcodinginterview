import { SigninForm } from "@/features/auth/components/signinForm";
import { requireUnAuth } from "@/lib/auth/utils";

const Page = async () => {
  await requireUnAuth();

  return <SigninForm />;
};

export default Page;
