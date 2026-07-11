import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";


export const useRunCode = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.submissions.run.mutationOptions({
      onError: (error) => {
        toast.error(`Run failed: ${error.message}`);
      },
    }),
  );
};

export const useSubmitCode = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.submissions.create.mutationOptions({
      onSuccess: (data) => {
        if (data.result === "PASSED") {
          toast.success("All test cases passed!");
        } else {
          toast.warning(
            `Submitted - ${data.passedTestCases}/${data.totalTestCases} test cases passed.`,
          );
        }
      },
      onError: (error) => {
        toast.error(`Submission failed: ${error.message}`);
      },
    }),
  );
};

export const useGetHint = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.submissions.getHint.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

export const useSaveBehavioralAnswer = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.submissions.saveBehavioralAnswer.mutationOptions({
      onError: (error) => {
        toast.error(`Could not save your answer: ${error.message}`);
      },
    }),
  );
};
