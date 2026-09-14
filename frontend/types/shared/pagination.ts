// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface Pagination<N> {
  page: number;
  pageSize: number;
  total: number;
  /**
   * Whether another page exists. Optional so existing endpoints are unaffected; set it
   * where total can't be derived exactly (e.g. Tinybird omits rows_before_limit_at_least)
   * so consumers have a signal that doesn't depend on total's accuracy.
   */
  hasMore?: boolean;
  data: N[];
}
