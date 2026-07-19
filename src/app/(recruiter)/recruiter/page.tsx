import { requireRecruiter } from "@/lib/auth/utils";
import { RecruiterHome } from "@/features/recruiters/components/recruiterHome";

const Page = async () => {
  await requireRecruiter();

  return <RecruiterHome />;
};

export default Page;
