// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
interface OrgDashBase {
    startDate: string;
    endDate: string;
}

export interface OrgDashActivity extends OrgDashBase {
    activityCount: number;
    orgActivityCount: number;
}

export interface OrgDashCommit extends OrgDashBase {
    commits: number,
    orgCommits: number
}

export interface OrgDashPrOpened extends OrgDashBase {
    pullRequestsOpened: number,
    orgPullRequestsOpened: number
}

export interface OrgDashAvgMergeTime extends OrgDashBase {
    averageMergeTimeSeconds: number,
    orgAverageMergeTimeSeconds: number
}

export interface OrgDashContributors extends OrgDashBase {
    contributorCount: number,
    orgContributorCount: number
}


export interface OrgDashMaintainers extends OrgDashBase {
    maintainersCount: number,
    orgMaintainersCount: number
}
