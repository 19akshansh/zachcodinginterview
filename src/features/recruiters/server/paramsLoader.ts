import { createLoader } from "nuqs/server";
import {
  recruiterInvitesParams,
  recruiterReviewParams,
  recruitersParams,
} from "../params";

export const recruitersParamsLoader = createLoader(recruitersParams);
export const recruiterInvitesParamsLoader = createLoader(
  recruiterInvitesParams,
);
export const recruiterReviewParamsLoader = createLoader(recruiterReviewParams);
