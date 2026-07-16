import { requireRecruiter } from "@/lib/auth/utils";
import { RecruiterHome } from "@/features/dashboard/recruiters/components/recruiterHome";

const Page = async () => {
  await requireRecruiter();

  return <RecruiterHome />;
};

export default Page;
