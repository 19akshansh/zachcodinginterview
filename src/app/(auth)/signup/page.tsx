import { SignupForm } from "@/features/auth/components/signupForm";
import { requireUnAuth } from "@/lib/auth/utils";

const Page = async () => {
  await requireUnAuth();

  return <SignupForm />;
};

export default Page;
