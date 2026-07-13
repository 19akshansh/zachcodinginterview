import { useQueryStates } from "nuqs";
import { practiceParams } from "../params";

export const usePracticeParams = () => {
  return useQueryStates(practiceParams);
};
