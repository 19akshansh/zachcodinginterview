import { requireAuth } from "@/lib/auth/utils";

const Page = async () => {
  await requireAuth();

  return <h1>Resume</h1>;
};

export default Page;
