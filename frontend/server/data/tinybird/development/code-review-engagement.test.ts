// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import {
  mockPRParticipantsCurrentSummary,
  mockPRParticipantsPreviousSummary,
  mockPRParticipantsData,
} from '../../../mocks/tinybird-code-review-engagement-response.mock';
import {
  mockActivitiesCountCurrentSummary,
  mockActivitiesCountPreviousSummary,
  mockQuarterlyActivitiesCountData,
} from '~~/server/mocks/tinybird-activities-count.mock';
import type { CodeReviewEngagement } from '~~/types/development/responses.types';
import type { CodeReviewEngagementFilter } from '~~/types/development/requests.types';
import { CodeReviewEngagementMetric } from '~~/types/development/requests.types';
import { ActivityTypes } from '~~/types/shared/activity-types';
import {
  ActiveContributorsTinybirdQuery,
  ActivitiesCountTinybirdQuery,
  ContributorsLeaderboardTinybirdQuery,
} from '~~/server/data/tinybird/requests.types';
import { Granularity } from '~~/types/shared/granularity';

const mockFetchFromTinybird = vi.fn();

/**
 * returns the expected Tinybird queries based on the provided filter and activity types.
 */
function getTinybirdQueries(
  filter: CodeReviewEngagementFilter,
  expectedActivityTypes: ActivityTypes[],
) {
  const participantsCurrentSummaryQuery: ActiveContributorsTinybirdQuery = {
    project: filter.project,
    repos: filter.repos,
    activity_types: expectedActivityTypes,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };

  const participantsPreviousSummaryQuery: ActiveContributorsTinybirdQuery = {
    ...participantsCurrentSummaryQuery,
    startDate: DateTime.utc(2023, 3, 19),
    endDate: DateTime.utc(2024, 3, 19),
  };

  const participantsDataQuery: ContributorsLeaderboardTinybirdQuery = {
    ...participantsCurrentSummaryQuery,
    limit: 5,
  };

  const commentsCurrentSummaryQuery: ActivitiesCountTinybirdQuery = participantsCurrentSummaryQuery;
  const commentsPreviousSummaryQuery: ActivitiesCountTinybirdQuery =
    participantsPreviousSummaryQuery;
  const commentsDataQuery: ActivitiesCountTinybirdQuery = {
    ...commentsCurrentSummaryQuery,
    granularity: filter.granularity,
  };

  const reviewsCurrentSummaryQuery: ActivitiesCountTinybirdQuery = commentsCurrentSummaryQuery;
  const reviewsPreviousSummaryQuery: ActivitiesCountTinybirdQuery =
    participantsPreviousSummaryQuery;
  const reviewsDataQuery: ActivitiesCountTinybirdQuery = commentsDataQuery;

  let expectedCurrentSummaryQuery, expectedPreviousSummaryQuery, expectedDataQuery;

  switch (filter.metric) {
    case CodeReviewEngagementMetric.PR_PARTICIPANTS:
      expectedCurrentSummaryQuery = participantsCurrentSummaryQuery;
      expectedPreviousSummaryQuery = participantsPreviousSummaryQuery;
      expectedDataQuery = participantsDataQuery;
      break;
    case CodeReviewEngagementMetric.REVIEW_COMMENTS:
      expectedCurrentSummaryQuery = commentsCurrentSummaryQuery;
      expectedPreviousSummaryQuery = commentsPreviousSummaryQuery;
      expectedDataQuery = commentsDataQuery;
      break;
    case CodeReviewEngagementMetric.CODE_REVIEWS:
      expectedCurrentSummaryQuery = reviewsCurrentSummaryQuery;
      expectedPreviousSummaryQuery = reviewsPreviousSummaryQuery;
      expectedDataQuery = reviewsDataQuery;
      break;
    default:
      throw new Error('Invalid metric');
  }

  return {
    expectedCurrentSummaryQuery,
    expectedPreviousSummaryQuery,
    expectedDataQuery,
  };
}

describe('Code Review Engagement Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // Here be dragons! vi.doMock is not hoisted, and thus it is executed after the original import statement.
    // This means that the import for tinybird.ts inside active-contributors.ts would still be used,
    // and thus not mocked. This means we need to import the module again after the mock is set, whenever we want to
    // use it.
    vi.doMock(import('../tinybird'), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  });

  const expectedPRParticipantsActivityTypes = [
    ActivityTypes.PULL_REQUEST_REVIEWED,
    ActivityTypes.PULL_REQUEST_ASSIGNED,
    ActivityTypes.PULL_REQUEST_COMMENT,
    ActivityTypes.PULL_REQUEST_REVIEW_THREAD_COMMENT,
    ActivityTypes.PULL_REQUEST_OPENED,
    ActivityTypes.PULL_REQUEST_REVIEW_REQUESTED,
    ActivityTypes.MERGE_REQUEST_REVIEW_CHANGES_REQUESTED,
    ActivityTypes.MERGE_REQUEST_REVIEW_APPROVED,
    ActivityTypes.MERGE_REQUEST_ASSIGNED,
    ActivityTypes.MERGE_REQUEST_COMMENT,
    ActivityTypes.MERGE_REQUEST_REVIEW_REQUESTED,
    ActivityTypes.MERGE_REQUEST_OPENED,
    ActivityTypes.CHANGESET_CREATED,
    ActivityTypes.CHANGESET_COMMENT_CREATED,
    ActivityTypes.PATCHSET_COMMENT_CREATED,
    ActivityTypes.PATCHSET_APPROVAL_CREATED,
  ];

  const expectedReviewCommentsActivityTypes = [
    ActivityTypes.PULL_REQUEST_COMMENT,
    ActivityTypes.PULL_REQUEST_REVIEW_THREAD_COMMENT,
    ActivityTypes.MERGE_REQUEST_COMMENT,
    ActivityTypes.CHANGESET_COMMENT_CREATED,
    ActivityTypes.PATCHSET_COMMENT_CREATED,
  ];

  const expectedCodeReviewsActivityTypes = [
    ActivityTypes.PULL_REQUEST_REVIEWED,
    ActivityTypes.MERGE_REQUEST_REVIEW_CHANGES_REQUESTED,
    ActivityTypes.MERGE_REQUEST_REVIEW_APPROVED,
    ActivityTypes.CHANGESET_COMMENT_CREATED,
    ActivityTypes.PATCHSET_COMMENT_CREATED,
  ];

  type MockResponse =
    | typeof mockPRParticipantsCurrentSummary
    | typeof mockPRParticipantsPreviousSummary
    | typeof mockPRParticipantsData
    | typeof mockActivitiesCountCurrentSummary
    | typeof mockActivitiesCountPreviousSummary
    | typeof mockQuarterlyActivitiesCountData;

  async function testCodeReviewEngagement(
    metric: CodeReviewEngagementMetric,
    expectedActivityTypes: ActivityTypes[],
    expectedSummariesPath: string,
    expectedDataPath: string,
    currentSummaryMock: MockResponse,
    previousSummaryMock: MockResponse,
    dataMock: MockResponse,
  ) {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const { fetchCodeReviewEngagement } = await import(
      '~~/server/data/tinybird/development/code-review-engagement'
    );

    mockFetchFromTinybird
      .mockResolvedValueOnce(currentSummaryMock)
      .mockResolvedValueOnce(previousSummaryMock)
      .mockResolvedValueOnce(dataMock);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter: CodeReviewEngagementFilter = {
      project: 'the-linux-kernel-organization',
      repos: ['some-repo'],
      granularity: Granularity.QUARTERLY,
      metric,
      startDate,
      endDate,
    };

    const result = await fetchCodeReviewEngagement(filter);

    const { expectedCurrentSummaryQuery, expectedPreviousSummaryQuery, expectedDataQuery } =
      getTinybirdQueries(filter, expectedActivityTypes);

    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      1,
      expectedSummariesPath,
      expectedCurrentSummaryQuery,
    );
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      2,
      expectedSummariesPath,
      expectedPreviousSummaryQuery,
    );
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(3, expectedDataPath, expectedDataQuery);

    let currentCount = 0;
    let previousCount = 0;
    let resultData;

    switch (filter.metric) {
      case CodeReviewEngagementMetric.PR_PARTICIPANTS:
        currentCount = mockPRParticipantsCurrentSummary.data[0].contributorCount;
        previousCount = mockPRParticipantsPreviousSummary.data[0].contributorCount;
        resultData = mockPRParticipantsData.data.map((item) => ({
          avatar: item.avatar,
          name: item.displayName,
          activityCount: item.contributionCount,
          percentage: item.contributionPercentage,
          roles: item.roles || [],
        }));
        break;
      case CodeReviewEngagementMetric.REVIEW_COMMENTS:
        currentCount = mockActivitiesCountCurrentSummary.data[0].activityCount;
        previousCount = mockActivitiesCountPreviousSummary.data[0].activityCount;
        resultData = mockQuarterlyActivitiesCountData.data.map((item) => ({
          startDate: item.startDate,
          endDate: item.endDate,
          comments: item.activityCount,
        }));
        break;
      case CodeReviewEngagementMetric.CODE_REVIEWS:
        currentCount = mockActivitiesCountCurrentSummary.data[0].activityCount;
        previousCount = mockActivitiesCountPreviousSummary.data[0].activityCount;
        resultData = mockQuarterlyActivitiesCountData.data.map((item) => ({
          startDate: item.startDate,
          endDate: item.endDate,
          reviews: item.activityCount,
        }));
        break;
      default:
        throw new Error('Invalid metric');
    }

    const expectedResult: CodeReviewEngagement = {
      summary: {
        current: currentCount,
        previous: previousCount,
        percentageChange: 100,
        changeValue: currentCount - previousCount,
        periodFrom: filter.startDate?.toISO() || '',
        periodTo: filter.endDate?.toISO() || '',
      },
      data: resultData,
    };

    expect(result).toEqual(expectedResult);
  }

  test.each([
    [
      CodeReviewEngagementMetric.PR_PARTICIPANTS,
      expectedPRParticipantsActivityTypes,
      '/v0/pipes/active_contributors.json',
      '/v0/pipes/contributors_leaderboard.json',
      mockPRParticipantsCurrentSummary,
      mockPRParticipantsPreviousSummary,
      mockPRParticipantsData,
    ],
    [
      CodeReviewEngagementMetric.REVIEW_COMMENTS,
      expectedReviewCommentsActivityTypes,
      '/v0/pipes/activities_count.json',
      '/v0/pipes/activities_count.json',
      mockActivitiesCountCurrentSummary,
      mockActivitiesCountPreviousSummary,
      mockQuarterlyActivitiesCountData,
    ],
    [
      CodeReviewEngagementMetric.CODE_REVIEWS,
      expectedCodeReviewsActivityTypes,
      '/v0/pipes/activities_count.json',
      '/v0/pipes/activities_count.json',
      mockActivitiesCountCurrentSummary,
      mockActivitiesCountPreviousSummary,
      mockQuarterlyActivitiesCountData,
    ],
  ])('should fetch code review engagement data with correct parameters', testCodeReviewEngagement);
});
