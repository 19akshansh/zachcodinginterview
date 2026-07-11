import { parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";
import { PAGINATION } from "@/config/constants";
import { InterviewStatus } from "@/config/enums";

export const interviewsParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  status: parseAsStringEnum<InterviewStatus>(
    Object.values(InterviewStatus),
  ).withOptions({ clearOnDefault: true }),
};
