import { createLoader } from "nuqs/server";
import {
  adminApplicationsParams,
  adminQuestionsParams,
  adminUsersParams,
} from "../params";

export const adminUsersParamsLoader = createLoader(adminUsersParams);
export const adminApplicationsParamsLoader = createLoader(
  adminApplicationsParams,
);
export const adminQuestionsParamsLoader = createLoader(adminQuestionsParams);
