// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import { type Ref, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { sortBy } from 'lodash-es';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type {
  OSSIndexCategoryGroup,
  OSSIndexCategoryGroupDetails,
} from '~~/types/ossindex/category-group';
import { LfxRoutes } from '~/components/shared/types/routes';
import type { OSSIndexCategory, OSSIndexCategoryDetails } from '~~/types/ossindex/category';
import type { OSSIndexCollection } from '~~/types/ossindex/collection';
import type { TreeMapData } from '~/components/uikit/chart/types/ChartTypes';

export type OSIType = 'vertical' | 'horizontal' | 'projects' | 'collections';
export interface BreadcrumbData {
  type: OSIType;
  group?: {
    name: string;
    slug: string;
  };
  category?: {
    name: string;
    slug: string;
  };
}

export type SortType = 'totalContributors' | 'softwareValue';

class OssIndexApiService {
  fetchOSSGroup(type: Ref<string>, sort: Ref<string>) {
    const queryKey = computed(() => [TanstackKey.OSS_INDEX_GROUP, type.value, sort.value]);
    const queryFn = computed<QueryFunction<OSSIndexCategoryGroup[]>>(() => this.ossGroupQueryFn(() => ({
        type: type.value,
        sort: sort.value,
      })));

    return useQuery<OSSIndexCategoryGroup[]>({
      queryKey,
      queryFn,
    });
  }

  ossGroupQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<OSSIndexCategoryGroup[]> {
    const { type, sort } = query();
    return async () => await $fetch(`/api/ossindex/groups`, {
        params: {
          type,
          sort,
        },
      });
  }

  fetchOSSCategory(groupSlug: string | undefined, sort: Ref<string>) {
    const queryKey = computed(() => [TanstackKey.OSS_INDEX_CATEGORY, groupSlug, sort.value]);
    const queryFn = computed<QueryFunction<OSSIndexCategoryGroupDetails>>(() => this.ossCategoryQueryFn(() => ({
        categoryGroupSlug: groupSlug,
        sort: sort.value,
      })));

    return useQuery<OSSIndexCategoryGroupDetails>({
      queryKey,
      queryFn,
    });
  }

  ossCategoryQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<OSSIndexCategoryGroupDetails> {
    const { categoryGroupSlug, sort } = query();
    return async () => await $fetch(`/api/ossindex/categories`, {
        params: {
          categoryGroupSlug,
          sort,
        },
      });
  }

  fetchOSSCollection(categorySlug: string | undefined, sort: Ref<string>) {
    const queryKey = computed(() => [TanstackKey.OSS_INDEX_COLLECTION, categorySlug, sort.value]);
    const queryFn = computed<QueryFunction<OSSIndexCategoryDetails>>(() => this.ossCollectionQueryFn(() => ({
        categorySlug,
        sort: sort.value,
      })));

    return useQuery<OSSIndexCategoryDetails>({
      queryKey,
      queryFn,
    });
  }

  ossCollectionQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<OSSIndexCategoryDetails> {
    const { categorySlug, sort, categoryGroupId } = query();
    return async () => await $fetch(`/api/ossindex/collections`, {
        params: {
          categorySlug,
          categoryGroupId,
          sort,
        },
      });
  }

  mapCategoryDataToTreeMapData(data: OSSIndexCategoryGroupDetails, sort: SortType): TreeMapData[] {
    const categoryGroups = this.convertCategoryToCategoryGroup(data.categories, data.type);
    return this.mapDataToTreeMapData(categoryGroups, 'category', sort);
  }

  mapCollectionDataToTreeMapData(data: OSSIndexCategoryDetails, sort: SortType): TreeMapData[] {
    const collectionGroups = this.convertCollectionToCategoryGroup(
      data.collections,
      data.categoryGroupType
    );
    return this.mapDataToTreeMapData(collectionGroups, 'collection', sort);
  }

  convertCategoryToCategoryGroup(data: OSSIndexCategory[], type: string): OSSIndexCategoryGroup[] {
    return data.map((category) => ({
      ...category,
      type,
    }));
  }

  convertCollectionToCategoryGroup(
    data: OSSIndexCollection[],
    type: string
  ): OSSIndexCategoryGroup[] {
    return data.map((collection) => ({
      ...collection,
      topCollections: [],
      type,
    }));
  }

  /**
   * Filter data by limit. This removes the data that is less than 1.5% of the total contributors.
   * @param data - Data
   * @returns Filtered data
   */
  filterDataByLimit(data: OSSIndexCategoryGroup[]): OSSIndexCategoryGroup[] {
    const percentage = 0.015; // 1.5% of the total contributors for the software value
    // Change this when we will sort by software value
    const total = data.reduce((sum, group) => sum + group.totalContributors, 0);
    const limit = total * percentage;

    return data.filter((group) => group.totalContributors >= limit);
  }

  mapDataToTreeMapData(
    data: OSSIndexCategoryGroup[],
    type: 'group' | 'category' | 'collection',
    sort: SortType
  ): TreeMapData[] {
    const minMax = this.getMinMaxValue(data, sort);
    let link = '';

    switch (type) {
      case 'group':
        link = `/${LfxRoutes.OPENSOURCEINDEX}/group`;
        break;
      case 'category':
        link = `/${LfxRoutes.OPENSOURCEINDEX}/category`;
        break;
      default: // collection
        link = '/collection';
    }

    const filteredData = this.filterDataByLimit(data);

    return (
      sortBy(
        filteredData.map((group) => {
          const rangeIndex = this.getRangeValue(
            minMax,
            sort === 'totalContributors' ? group.totalContributors : group.softwareValue
          );

          return {
            id: group.id,
            name: group.name,
            value: [
              sort === 'totalContributors' ? group.totalContributors : group.softwareValue,
              rangeIndex,
            ],
            slug: group.slug,
            totalContributors: group.totalContributors,
            softwareValue: group.softwareValue,
            avgScore: group.avgScore,
            type: group.type,
            topProjects: group.topProjects.map((project) => ({
              ...project,
              logoUrl: project.logo,
            })),
            topCollections: group.topCollections,
            link: `${link}/${group.slug}`,
            target: '_self',
          };
        }),
        sort
      ) || []
    );
  }

  getMinMaxValue(
    data: OSSIndexCategoryGroup[],
    property: keyof OSSIndexCategoryGroup
  ): [number, number] {
    const values = data.map((item) => Number(item[property]));
    return [Math.min(...values), Math.max(...values)];
  }

  getRangeValue(minMax: [number, number], value: number): number {
    const rangeLength = 5;
    const min = minMax[0];
    const max = minMax[1];

    // Calculate range size
    const rangeSize = (max - min) / rangeLength;

    // Create ranges
    const ranges = Array.from({ length: rangeLength }, (_, i) => ({
      min: min + rangeSize * i,
      max: min + rangeSize * (i + 1),
    }));

    // Assign range index to each item
    return ranges.findLastIndex((range) => value >= range.min && value <= range.max);
  }
}

export const OSS_INDEX_API_SERVICE = new OssIndexApiService();
