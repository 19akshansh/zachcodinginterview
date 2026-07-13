import { parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";
import { PAGINATION } from "@/config/constants";
import { CompanyTier, Difficulty, SeniorityLevel } from "@/config/enums";
import { PRACTICE_TYPES } from "@/config/enums";

export const practiceParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  type: parseAsStringEnum([...PRACTICE_TYPES]).withOptions({
    clearOnDefault: true,
  }),
  difficulty: parseAsStringEnum(Object.values(Difficulty)).withOptions({
    clearOnDefault: true,
  }),
  seniorityLevel: parseAsStringEnum(Object.values(SeniorityLevel)).withOptions({
    clearOnDefault: true,
  }),
  companyTier: parseAsStringEnum(Object.values(CompanyTier)).withOptions({
    clearOnDefault: true,
  }),
};
