import { requireAuth } from "@/lib/authUtils";

const Page = async () => {
  await requireAuth();

  return <h1>Practice</h1>;
};

export default Page;
