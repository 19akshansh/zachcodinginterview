import { parseAsInteger } from "nuqs/server";
import { PAGINATION } from "@/config/constants";

export const homeParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DASHBOARD_RECENT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
};
