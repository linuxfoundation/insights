// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const mockCurrentData = {
  meta: [
    {
      name: "openedToMergedSeconds",
      type: "Nullable(Float64)"
    },
    {
      name: "openedToReviewAssignedSeconds",
      type: "Nullable(Float64)"
    },
    {
      name: "reviewAssignedToFirstReviewSeconds",
      type: "Nullable(Float64)"
    },
    {
      name: "firstReviewToApprovedSeconds",
      type: "Nullable(Float64)"
    },
    {
      name: "approvedToMergedSeconds",
      type: "Nullable(Float64)"
    }
  ],
  data: [
    {
      openedToMergedSeconds: 100,
      openedToReviewAssignedSeconds: 29628,
      reviewAssignedToFirstReviewSeconds: 148790,
      firstReviewToApprovedSeconds: 29272,
      approvedToMergedSeconds: 96405
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.008990494,
    rows_read: 146,
    bytes_read: 10365
  }
};

export const mockPreviousData = {
  meta: [
    {
      name: "openedToMergedSeconds",
      type: "Nullable(Float64)"
    },
    {
      name: "openedToReviewAssignedSeconds",
      type: "Nullable(Float64)"
    },
    {
      name: "reviewAssignedToFirstReviewSeconds",
      type: "Nullable(Float64)"
    },
    {
      name: "firstReviewToApprovedSeconds",
      type: "Nullable(Float64)"
    },
    {
      name: "approvedToMergedSeconds",
      type: "Nullable(Float64)"
    }
  ],
  data: [
    {
      openedToMergedSeconds: 50,
      openedToReviewAssignedSeconds: 21665,
      reviewAssignedToFirstReviewSeconds: 55102,
      firstReviewToApprovedSeconds: 25790,
      approvedToMergedSeconds: 141256
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.156914285,
    rows_read: 732,
    bytes_read: 50799
  }
};
