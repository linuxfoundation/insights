// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { computed, type Ref } from 'vue';
import { POPULARITY_API_SERVICE } from '~/components/modules/widget/services/popularity.api.service';
import { Widget } from '~/components/modules/widget/types/widget';
import { lfxWidgets } from '~/components/modules/widget/config/widget.config';
import { Granularity } from '~~/types/shared/granularity';

interface PopularityExcludedWidgetsParams {
  projectSlug: Ref<string>;
  repos: Ref<string[] | undefined>;
  startDate: Ref<string | null>;
  endDate: Ref<string | null>;
  projectWidgets: Ref<string[]>;
}

// Widget keys that require data checks, grouped by the endpoint they share
const DOWNLOADS_WIDGETS = [Widget.PACKAGE_DOWNLOADS, Widget.PACKAGE_DEPENDENCY];
const SEARCH_QUERIES_WIDGETS = [Widget.SEARCH_QUERIES];
const MAILING_LIST_WIDGETS = [Widget.MAILING_LISTS_MESSAGES];

function isWidgetEnabled(widget: Widget, projectWidgets: string[]): boolean {
  return projectWidgets.includes(lfxWidgets[widget]?.key);
}

export function usePopularityExcludedWidgets(params: PopularityExcludedWidgetsParams) {
  const hasDownloadsWidget = computed(() =>
    DOWNLOADS_WIDGETS.some((w) => isWidgetEnabled(w, params.projectWidgets.value)),
  );
  const hasSearchQueriesWidget = computed(() =>
    SEARCH_QUERIES_WIDGETS.some((w) => isWidgetEnabled(w, params.projectWidgets.value)),
  );
  const hasMailingListWidget = computed(() =>
    MAILING_LIST_WIDGETS.some((w) => isWidgetEnabled(w, params.projectWidgets.value)),
  );

  const popularityParams = computed(() => ({
    projectSlug: params.projectSlug.value,
    repos: params.repos.value,
    granularity: Granularity.MONTHLY,
    startDate: params.startDate.value,
    endDate: params.endDate.value,
  }));

  const downloadsParams = computed(() => ({
    ...popularityParams.value,
    ecosystem: undefined,
    name: undefined,
  }));

  const mailingListMessagesParams = computed(() => ({
    ...popularityParams.value,
    type: 'new',
    countType: 'new',
  }));

  // Only fetch if respective widgets are enabled
  const {
    data: downloadsData,
    status: downloadsStatus,
    suspense: downloadsSuspense,
  } = POPULARITY_API_SERVICE.fetchPackageDownloads(downloadsParams, hasDownloadsWidget);

  const isPackageDownloadsEmpty = computed(() =>
    POPULARITY_API_SERVICE.isPackageDownloadsEmpty(
      downloadsStatus.value === 'success' ? downloadsData.value : undefined,
    ),
  );

  const isPackageDependencyEmpty = computed(() =>
    POPULARITY_API_SERVICE.isPackageDependencyEmpty(
      downloadsStatus.value === 'success' ? downloadsData.value : undefined,
    ),
  );

  const {
    data: searchQueriesData,
    status: searchQueriesStatus,
    suspense: searchQueriesSuspense,
  } = POPULARITY_API_SERVICE.fetchSearchQueries(popularityParams, hasSearchQueriesWidget);

  const isSearchQueriesEmpty = computed(() =>
    POPULARITY_API_SERVICE.isSearchQueriesEmpty(
      searchQueriesStatus.value === 'success' ? searchQueriesData.value : undefined,
    ),
  );

  const {
    data: mailingListMessagesData,
    status: mailingListMessagesStatus,
    suspense: mailingListMessagesSuspense,
  } = POPULARITY_API_SERVICE.fetchMailingListsMessages(
    mailingListMessagesParams,
    hasMailingListWidget,
  );

  const isMailingListMessagesEmpty = computed(() =>
    POPULARITY_API_SERVICE.isMailingListMessagesEmpty(
      mailingListMessagesStatus.value === 'success' ? mailingListMessagesData.value : undefined,
    ),
  );

  const excludedWidgets = computed(() => {
    const excluded: Widget[] = [];
    if (isPackageDownloadsEmpty.value) {
      excluded.push(Widget.PACKAGE_DOWNLOADS);
    }
    if (isPackageDependencyEmpty.value) {
      excluded.push(Widget.PACKAGE_DEPENDENCY);
    }
    if (isSearchQueriesEmpty.value) {
      excluded.push(Widget.SEARCH_QUERIES);
    }
    if (isMailingListMessagesEmpty.value) {
      excluded.push(Widget.MAILING_LISTS_MESSAGES);
    }
    return excluded;
  });

  return {
    excludedWidgets,
    downloadsSuspense,
    searchQueriesSuspense,
    mailingListMessagesSuspense,
  };
}
