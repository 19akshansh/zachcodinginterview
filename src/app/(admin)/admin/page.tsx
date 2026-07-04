import { requireAdmin } from "@/lib/authUtils";

const Page = async () => {
  await requireAdmin();

  return <h1>Admin</h1>;
};

export default Page;
