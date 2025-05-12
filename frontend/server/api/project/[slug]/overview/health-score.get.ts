// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * Query params:
 * - project: string
 * - repository: string
 */
import { DateTime } from 'luxon';

import { createDataSource } from '~~/server/data/data-sources';
import {
  type DefaultFilter,
  DemographicType,
  FilterGranularity,
  ActivityFilterCountType
} from '~~/server/data/types';
import type { HealthScore } from '~~/types/overview/responses.types';
import { ActivityTypes } from '~~/types/shared/activity-types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';
import { embargoedCountries } from '~~/types/shared/embargoed-countries';
import { formatSecondsToDuration } from '~/components/shared/utils/formatter';
import { FormatterUnits } from '~/components/shared/types/formatter.types';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;

  /*
   * Health score will have a default time period of 365 days for most of the data
   * except for the following:
   * - active contributors and retention = (Previous Quarter)
   * - geographical distribution = (all time)
   */
  const filter: DefaultFilter = {
    project,
    repo: undefined,
    startDate: DateTime.now().minus({ days: 365 }).startOf('day'),
    endDate: DateTime.now().endOf('day')
  };

  if (query.repository && (query.repository as string).trim() !== '') {
    filter.repo = query.repository as string;
  }

  const filterPreviousQuarter: DefaultFilter = {
    ...filter,
    startDate: DateTime.now().minus({ quarters: 1 }).startOf('quarter'),
    endDate: DateTime.now().minus({ quarters: 1 }).endOf('quarter')
  };
  const filterAllTime: DefaultFilter = {
    project,
    repo: undefined
  };

  const dataSource = createDataSource();

  try {
    const healthScore: HealthScore[] = [];
    const allQuery = Promise.all([
      dataSource.fetchActiveContributors(filterPreviousQuarter),
      dataSource.fetchContributorDependency(filter),
      dataSource.fetchOrganizationDependency(filter),
      dataSource.fetchGeographicDistribution(filterAllTime),
      dataSource.fetchRetention({
        ...filterPreviousQuarter,
        demographicType: DemographicType.CONTRIBUTORS,
        onlyContributions: false,
        granularity: FilterGranularity.WEEKLY
      }),
      dataSource.fetchStarsActivities({
        ...filter,
        granularity: FilterGranularity.WEEKLY,
        activity_type: ActivityTypes.STARS,
        countType: ActivityFilterCountType.CUMULATIVE,
        onlyContributions: false
      }),
      dataSource.fetchForksActivities({
        ...filter,
        granularity: FilterGranularity.WEEKLY,
        activity_type: ActivityTypes.FORKS,
        countType: ActivityFilterCountType.CUMULATIVE,
        onlyContributions: false
      }),
      dataSource.fetchIssuesResolution({
        ...filter,
        granularity: FilterGranularity.WEEKLY,
        countType: ActivityFilterCountType.NEW,
        activity_type: ActivityTypes.ISSUES_CLOSED,
        onlyContributions: false
      }),
      dataSource.fetchPullRequests({
        ...filter,
        countType: ActivityFilterCountType.NEW, // This isn't used but required the interface
        activity_type: ActivityTypes.ISSUES_CLOSED, // This isn't used but required the interface
        onlyContributions: false
      }),
      dataSource.fetchMergeLeadTime(filter),
      dataSource.fetchActiveDays(filter)
    ]);

    const [
      activeContributors,
      contributorDependency,
      organizationDependency,
      geographicalDistribution,
      retention,
      stars,
      forks,
      issuesResolution,
      pullRequests,
      mergeLeadTime,
      activeDays
    ] = await allQuery;

    healthScore.push({
      key: BenchmarkKeys.ActiveContributors,
      value: activeContributors.summary.current
    });

    healthScore.push({
      key: BenchmarkKeys.ContributorDependency,
      value: contributorDependency.topContributors.count
    });

    healthScore.push({
      key: BenchmarkKeys.OrganizationDependency,
      value: organizationDependency.topOrganizations.count
    });

    const embargoCountries = geographicalDistribution.data?.filter((item) => embargoedCountries.includes(item.name));

    healthScore.push({
      key: BenchmarkKeys.GeographicalDistribution,
      value: embargoCountries?.length || 0
    });

    const retentionValue = retention && retention.length > 0 ? retention[retention.length - 1].percentage : 0;
    healthScore.push({
      key: BenchmarkKeys.Retention,
      value: retentionValue
    });

    const starsValue = stars && stars.data.length > 0 ? stars.data[stars.data.length - 1].stars : 0;
    healthScore.push({
      key: BenchmarkKeys.Stars,
      value: starsValue
    });

    const forksValue = forks && forks.data.length > 0 ? forks.data[forks.data.length - 1].forks : 0;
    healthScore.push({
      key: BenchmarkKeys.Forks,
      value: forksValue
    });

    const issuesResolutionValue = Number(
      formatSecondsToDuration(
        issuesResolution.summary.avgVelocityInDays || 0,
        'no',
        FormatterUnits.DAYS
      )
    );

    healthScore.push({
      key: BenchmarkKeys.IssuesResolution,
      value: issuesResolutionValue
    });

    healthScore.push({
      key: BenchmarkKeys.PullRequests,
      value: pullRequests.summary.current
    });

    const mergeLeadTimeValue = Number(
      formatSecondsToDuration(
        mergeLeadTime.summary.current || 0,
        'no',
        FormatterUnits.DAYS
      )
    );

    healthScore.push({
      key: BenchmarkKeys.MergeLeadTime,
      value: mergeLeadTimeValue
    });

    healthScore.push({
      key: BenchmarkKeys.ActiveDays,
      value: activeDays.summary.current
    });

    return healthScore;
  } catch (error) {
    console.error('Error fetching active contributors:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch active contributors data',
      data: { message: error.message }
    });
  }
});
