import { parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";
import { PAGINATION } from "@/config/constants";
import {
  ApplicationStatus,
  QuestionApprovalStatus,
  UserRole,
} from "@/config/enums";

export const adminUsersParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  role: parseAsStringEnum<UserRole>(Object.values(UserRole)).withOptions({
    clearOnDefault: true,
  }),
};

export const adminApplicationsParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  status: parseAsStringEnum<ApplicationStatus>(Object.values(ApplicationStatus))
    .withDefault(ApplicationStatus.PENDING)
    .withOptions({ clearOnDefault: true }),
};

export const adminQuestionsParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  status: parseAsStringEnum<QuestionApprovalStatus>(
    Object.values(QuestionApprovalStatus),
  )
    .withDefault(QuestionApprovalStatus.PENDING)
    .withOptions({ clearOnDefault: true }),
};
