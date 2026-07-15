import { useQueryStates } from "nuqs";
import { settingsParams } from "../params";

export const useSettingsParams = () => {
  return useQueryStates(settingsParams);
};
