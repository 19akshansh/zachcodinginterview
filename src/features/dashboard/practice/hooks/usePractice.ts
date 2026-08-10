import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { usePracticeParams } from "./usePracticeParams";
import { PAGINATION } from "@/config/constants";

const getPracticeListBaseKey = (trpc: ReturnType<typeof useTRPC>) => {
  const key = trpc.practice.getMany.queryOptions({
    page: PAGINATION.DEFAULT_PAGE,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    search: "",
  }).queryKey;

  return [key[0]];
};

export const useSuspensePractice = () => {
  const trpc = useTRPC();
  const [params] = usePracticeParams();

  return useSuspenseQuery(
    trpc.practice.getMany.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      type: params.type ?? undefined,
      difficulty: params.difficulty ?? undefined,
      seniorityLevel: params.seniorityLevel ?? undefined,
      companyTier: params.companyTier ?? undefined,
    }),
  );
};

export const useSuspensePracticeQuestion = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.practice.getOne.queryOptions({ id }));
};

export const useRunPracticeCode = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.practice.run.mutationOptions({
      onError: (error) => toast.error(`Run failed: ${error.message}`),
    }),
  );
};

export const useSubmitPracticeCode = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.practice.submit.mutationOptions({
      onSuccess: (data, variables) => {
        if (data.result === "PASSED") {
          toast.success("All test cases passed!");
        } else {
          toast.warning(
            `Submitted - ${data.passedTestCases}/${data.totalTestCases} test cases passed.`,
          );
        }
        queryClient.invalidateQueries({
          queryKey: trpc.practice.getOne.queryOptions({
            id: variables.questionId,
          }).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: getPracticeListBaseKey(trpc),
        });
      },
      onError: (error) => toast.error(`Submission failed: ${error.message}`),
    }),
  );
};

export const useSaveDraftTextAnswer = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.practice.saveTextAnswer.mutationOptions({
      onError: (error) =>
        toast.error(`Could not save your answer: ${error.message}`),
    }),
  );
};

export const useSubmitTextAnswer = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.practice.submitTextAnswer.mutationOptions({
      onSuccess: (data, variables) => {
        if (data.result === "PASSED") {
          toast.success("Nice work - strong answer!");
        } else if (data.result === "PARTIAL") {
          toast.warning("Decent start - check the feedback for gaps.");
        } else {
          toast.error("Needs work - see the AI feedback below.");
        }
        queryClient.invalidateQueries({
          queryKey: trpc.practice.getOne.queryOptions({
            id: variables.questionId,
          }).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: getPracticeListBaseKey(trpc),
        });
      },
      onError: (error) => toast.error(`Grading failed: ${error.message}`),
    }),
  );
};

export const useGetPracticeHint = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.practice.getHint.mutationOptions({
      onError: (error) => toast.error(error.message),
    }),
  );
};
