import { requireAuth } from "@/lib/auth/utils";

const Page = async () => {
  await requireAuth();

  return <h1>Dashboard</h1>;
};

export default Page;
