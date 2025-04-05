export const mockCurrentOpenedPRsSummary = {
  meta: [
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      activityCount: 100
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.320078864,
    rows_read: 357628,
    bytes_read: 18362864
  }
};

export const mockPreviousOpenedPRsSummary = {
  meta: [
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      activityCount: 50
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.279353225,
    rows_read: 474679,
    bytes_read: 24215414
  }
};

export const mockCurrentMergedPRsSummary = {
  meta: [
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      activityCount: 25
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.320078864,
    rows_read: 357628,
    bytes_read: 18362864
  }
};

export const mockPreviousMergedPRsSummary = {
  meta: [
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      activityCount: 50
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.279353225,
    rows_read: 474679,
    bytes_read: 24215414
  }
};

export const mockCurrentClosedPRsSummary = {
  meta: [
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      activityCount: 10
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.320078864,
    rows_read: 357628,
    bytes_read: 18362864
  }
};

export const mockPreviousClosedPRsSummary = {
  meta: [
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      activityCount: 5
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.279353225,
    rows_read: 474679,
    bytes_read: 24215414
  }
};

export const mockOpenedPullRequests = {
  meta: [
    {
      name: "startDate",
      type: "Nullable(Date)"
    },
    {
      name: "endDate",
      type: "Nullable(Date)"
    },
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      startDate: "2023-03-01",
      endDate: "2023-03-31",
      activityCount: 11
    },
    {
      startDate: "2023-04-01",
      endDate: "2023-04-30",
      activityCount: 4
    },
    {
      startDate: "2023-05-01",
      endDate: "2023-05-31",
      activityCount: 7
    },
    {
      startDate: "2023-06-01",
      endDate: "2023-06-30",
      activityCount: 21
    },
  ],
  rows: 13,
  statistics: {
    elapsed: 0.031928949,
    rows_read: 475680,
    bytes_read: 24223415
  }
};

export const mockMergedPullRequests = {
  meta: [
    {
      name: "startDate",
      type: "Nullable(Date)"
    },
    {
      name: "endDate",
      type: "Nullable(Date)"
    },
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      startDate: "2023-03-01",
      endDate: "2023-03-31",
      activityCount: 8
    },
    {
      startDate: "2023-04-01",
      endDate: "2023-04-30",
      activityCount: 1
    },
    {
      startDate: "2023-05-01",
      endDate: "2023-05-31",
      activityCount: 6
    },
    {
      startDate: "2023-06-01",
      endDate: "2023-06-30",
      activityCount: 6
    },
  ],
  rows: 13,
  statistics: {
    elapsed: 0.031928949,
    rows_read: 475680,
    bytes_read: 24223415
  }
};

export const mockClosedPullRequests = {
  meta: [
    {
      name: "startDate",
      type: "Nullable(Date)"
    },
    {
      name: "endDate",
      type: "Nullable(Date)"
    },
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      startDate: "2023-03-01",
      endDate: "2023-03-31",
      activityCount: 2
    },
    {
      startDate: "2023-04-01",
      endDate: "2023-04-30",
      activityCount: 1
    },
    {
      startDate: "2023-05-01",
      endDate: "2023-05-31",
      activityCount: 3
    },
    {
      startDate: "2023-06-01",
      endDate: "2023-06-30",
      activityCount: 2
    },
  ],
  rows: 13,
  statistics: {
    elapsed: 0.031928949,
    rows_read: 475680,
    bytes_read: 24223415
  }
};

export const mockPullRequestsVelocity = {
  meta: [
    {
      name: "startDate",
      type: "Nullable(Date)"
    },
    {
      name: "endDate",
      type: "Nullable(Date)"
    },
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      averagePullRequestResolveVelocitySeconds: 7451999
    },
  ],
  rows: 13,
  statistics: {
    elapsed: 0.031928949,
    rows_read: 475680,
    bytes_read: 24223415
  }
};
