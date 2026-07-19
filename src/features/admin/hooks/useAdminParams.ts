import { useQueryStates } from "nuqs";
import {
  adminApplicationsParams,
  adminQuestionsParams,
  adminUsersParams,
} from "../params";

export const useAdminUsersParams = () => {
  return useQueryStates(adminUsersParams);
};

export const useAdminApplicationsParams = () => {
  return useQueryStates(adminApplicationsParams);
};

export const useAdminQuestionsParams = () => {
  return useQueryStates(adminQuestionsParams);
};
