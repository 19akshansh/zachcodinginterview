import { requireAdmin } from "@/lib/auth/utils";

const Page = async () => {
  await requireAdmin();

  return <h1>Admin</h1>;
};

export default Page;
