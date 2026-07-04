import { SignupForm } from "@/features/auth/components/signupForm";
import { requireUnAuth } from "@/lib/authUtils";

const Page = async () => {
  await requireUnAuth();

  return <SignupForm />;
};

export default Page;
