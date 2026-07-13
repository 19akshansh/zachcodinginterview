import { useQueryStates } from "nuqs";
import { reportsParams } from "../params";

export const useReportsParams = () => {
  return useQueryStates(reportsParams);
};
