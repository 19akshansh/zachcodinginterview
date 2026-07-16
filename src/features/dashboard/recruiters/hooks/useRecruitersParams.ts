import { useQueryStates } from "nuqs";
import {
  recruiterInvitesParams,
  recruiterReviewParams,
  recruitersParams,
} from "../params";

export const useRecruitersParams = () => {
  return useQueryStates(recruitersParams);
};

export const useRecruiterInvitesParams = () => {
  return useQueryStates(recruiterInvitesParams);
};

export const useRecruiterReviewParams = () => {
  return useQueryStates(recruiterReviewParams);
};
