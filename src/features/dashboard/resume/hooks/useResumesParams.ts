import { useQueryStates } from "nuqs";
import { resumesParams } from "../params";

export const useResumesParams = () => {
  return useQueryStates(resumesParams);
};
