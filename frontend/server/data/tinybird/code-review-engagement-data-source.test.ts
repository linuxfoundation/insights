// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import {DateTime} from "luxon";
import {
  mockPRParticipantsCurrentSummary,
  mockPRParticipantsPreviousSummary,
  mockPRParticipantsData,
} from '../../mocks/tinybird-code-review-engagement-response.mock';
import type {ActiveContributorsFilter, ContributorsLeaderboardFilter} from "~~/server/data/types";
import type {CodeReviewEngagement} from "~~/types/development/responses.types";
import type {CodeReviewEngagementFilter} from "~~/types/development/requests.types";
import {CodeReviewEngagementMetric} from "~~/types/development/requests.types";
import {ActivityTypes} from "~~/types/shared/activity-types";

const mockFetchFromTinybird = vi.fn();

describe('Code Review Engagement Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // Here be dragons! vi.doMock is not hoisted, and thus it is executed after the original import statement.
    // This means that the import for tinybird.ts inside active-contributors-data-source.ts would still be used,
    // and thus not mocked. This means we need to import the module again after the mock is set, whenever we want to
    // use it.
    vi.doMock(import("./tinybird"), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  })

  const expectedPRParticipantsActivityTypes = [
    ActivityTypes.PULL_REQUEST_REVIEWED,
    ActivityTypes.PULL_REQUEST_ASSIGNED,
    ActivityTypes.PULL_REQUEST_COMMENT,
    ActivityTypes.PULL_REQUEST_REVIEW_THREAD_COMMENT,
    ActivityTypes.PULL_REQUEST_OPENED,
    ActivityTypes.PULL_REQUEST_REVIEW_REQUESTED,
  ];

  const expectedReviewCommentsActivityTypes = [
    ActivityTypes.PULL_REQUEST_COMMENT,
    ActivityTypes.PULL_REQUEST_REVIEW_THREAD_COMMENT,
  ];

  const expectedCodeReviewsActivityTypes = [
    ActivityTypes.PULL_REQUEST_REVIEWED,
  ];

  test.each([
    [CodeReviewEngagementMetric.PR_PARTICIPANTS, expectedPRParticipantsActivityTypes],
    [CodeReviewEngagementMetric.REVIEW_COMMENTS, expectedReviewCommentsActivityTypes],
    [CodeReviewEngagementMetric.CODE_REVIEWS, expectedCodeReviewsActivityTypes],
  ])(
    'should fetch code review engagement data with correct parameters',
    async (metric: CodeReviewEngagementMetric, expectedActivityTypes: ActivityTypes[]) => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchCodeReviewEngagement} = await import("~~/server/data/tinybird/code-review-engagement-data-source");

    mockFetchFromTinybird
      .mockResolvedValueOnce(mockPRParticipantsCurrentSummary)
      .mockResolvedValueOnce(mockPRParticipantsPreviousSummary)
      .mockResolvedValueOnce(mockPRParticipantsData);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter: CodeReviewEngagementFilter = {
      project: 'the-linux-kernel-organization',
      repo: 'some-repo',
      metric,
      startDate,
      endDate
    };

    const result = await fetchCodeReviewEngagement(filter);

    const expectedCurrentSummaryQuery: ActiveContributorsFilter = {
      project: filter.project,
      repo: filter.repo,
      activity_types: expectedActivityTypes,
      startDate: filter.startDate,
      endDate: filter.endDate,
    };

    const expectedPreviousSummaryQuery: ActiveContributorsFilter = {
      project: filter.project,
      repo: filter.repo,
      activity_types: expectedActivityTypes,
      startDate: DateTime.utc(2023, 3, 19),
      endDate: DateTime.utc(2024, 3, 19),
    };

    const expectedDataQuery: ContributorsLeaderboardFilter = {
      project: filter.project,
      repo: filter.repo,
      activity_types: expectedActivityTypes,
      limit: 5,
      startDate: filter.startDate,
      endDate: filter.endDate,
    };

    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      1,
      '/v0/pipes/active_contributors.json',
      expectedCurrentSummaryQuery
    );
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      2,
      '/v0/pipes/active_contributors.json',
      expectedPreviousSummaryQuery
    );
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      3,
      '/v0/pipes/contributors_leaderboard.json',
      expectedDataQuery
    );

    const currentCount = mockPRParticipantsCurrentSummary.data[0]?.contributorCount || 0;
    const previousCount = mockPRParticipantsPreviousSummary.data[0]?.contributorCount || 0;

    const expectedResult: CodeReviewEngagement = {
      summary: {
        current: currentCount,
        previous: previousCount,
        percentageChange: 100,
        changeValue: currentCount - previousCount,
        periodFrom: filter.startDate?.toISO() || '',
        periodTo: filter.endDate?.toISO() || '',
      },
      data: mockPRParticipantsData.data.map((item) => ({
        avatar: item.avatar,
        name: item.displayName,
        activityCount: item.contributionCount,
        percentage: item.contributionPercentage,
        roles: item.roles || [],
      }))
    };

    expect(result).toEqual(expectedResult);
  }
);

  // TODO: Add checks for invalid dates, invalid data, sql injections, and other edge cases.
});
