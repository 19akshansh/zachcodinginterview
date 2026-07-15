import { useQueryStates } from "nuqs";
import { homeParams } from "../params";

export const useHomeParams = () => {
  return useQueryStates(homeParams);
};
