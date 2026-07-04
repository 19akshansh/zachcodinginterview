import { requireRecruiter } from "@/lib/authUtils";

const Page = async () => {
  await requireRecruiter();

  return <h1>Recruiter</h1>;
};

export default Page;
