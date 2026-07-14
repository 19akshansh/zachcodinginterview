import { requireRecruiter } from "@/lib/auth/utils";

const Page = async () => {
  await requireRecruiter();

  return <h1>Recruiter</h1>;
};

export default Page;
