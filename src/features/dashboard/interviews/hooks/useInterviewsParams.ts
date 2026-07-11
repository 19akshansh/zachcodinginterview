import { useQueryStates } from "nuqs";
import { interviewsParams } from "../params";

export const useInterviewsParams = () => {
  return useQueryStates(interviewsParams);
};
