// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import { type Ref, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type {
  OSSIndexCategoryGroup,
  OSSIndexCategoryGroupDetails
} from '~~/types/ossindex/category-group';
import { LfxRoutes } from '~/components/shared/types/routes';
import type {
  OSSIndexCategory,
  OSSIndexCategoryDetails
} from '~~/types/ossindex/category';
import type { OSSIndexCollection } from '~~/types/ossindex/collection';
import type { TreeMapData } from '~/components/uikit/chart/types/ChartTypes';

export interface BreadcrumbData {
  group?: {
    name: string;
    slug: string;
  };
  category?: {
    name: string;
    slug: string;
  };
}

class OssIndexApiService {
  fetchOSSGroup(type: Ref<string>, enabled: boolean) {
    const queryKey = computed(() => [TanstackKey.OSS_INDEX_GROUP, type.value]);
    const queryFn = computed<QueryFunction<OSSIndexCategoryGroup[]>>(() => this.ossGroupQueryFn(() => ({
        type: type.value
      })));

    return useQuery<OSSIndexCategoryGroup[]>({
      queryKey,
      queryFn,
      enabled
    });
  }

  ossGroupQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<OSSIndexCategoryGroup[]> {
    const { type } = query();
    return async () => await $fetch(`/api/ossindex/groups`, {
        params: {
          type
        }
      });
  }

  fetchOSSCategory(groupSlug: string | undefined) {
    const queryKey = computed(() => [TanstackKey.OSS_INDEX_CATEGORY, groupSlug]);
    const queryFn = computed<QueryFunction<OSSIndexCategoryGroupDetails>>(() => this.ossCategoryQueryFn(() => ({
        categoryGroupSlug: groupSlug
      })));

    return useQuery<OSSIndexCategoryGroupDetails>({
      queryKey,
      queryFn,
      enabled: !!groupSlug
    });
  }

  ossCategoryQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<OSSIndexCategoryGroupDetails> {
    const { categoryGroupSlug } = query();
    return async () => await $fetch(`/api/ossindex/categories`, {
        params: {
          categoryGroupSlug
        }
      });
  }

  fetchOSSCollection(categorySlug: string | undefined) {
    const queryKey = computed(() => [TanstackKey.OSS_INDEX_COLLECTION, categorySlug]);
    const queryFn = computed<QueryFunction<OSSIndexCategoryDetails>>(() => this.ossCollectionQueryFn(() => ({
        categorySlug
      })));

    return useQuery<OSSIndexCategoryDetails>({
      queryKey,
      queryFn,
      enabled: !!categorySlug
    });
  }

  ossCollectionQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<OSSIndexCategoryDetails> {
    const { categorySlug } = query();
    return async () => await $fetch(`/api/ossindex/collections`, {
        params: {
          categorySlug
        }
      });
  }

  mapCategoryDataToTreeMapData(data: OSSIndexCategoryGroupDetails): TreeMapData[] {
    const categoryGroups = this.convertCategoryToCategoryGroup(
      data.categories,
      data.type
    );
    return this.mapDataToTreeMapData(categoryGroups, 'category');
  }

  mapCollectionDataToTreeMapData(data: OSSIndexCategoryDetails): TreeMapData[] {
    const collectionGroups = this.convertCollectionToCategoryGroup(
      data.collections,
      data.categoryGroupType
    );
    return this.mapDataToTreeMapData(collectionGroups, 'collection');
  }

  convertCategoryToCategoryGroup(
    data: OSSIndexCategory[],
    type: string
  ): OSSIndexCategoryGroup[] {
    return data.map((category) => ({
      ...category,
      type
    }));
  }

  convertCollectionToCategoryGroup(
    data: OSSIndexCollection[],
    type: string
  ): OSSIndexCategoryGroup[] {
    return data.map((collection) => ({
      ...collection,
      topCollections: [],
      type
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
    type: 'group' | 'category' | 'collection'
  ): TreeMapData[] {
    const minMax = this.getMinMaxValue(data, 'totalContributors');
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
      filteredData.map((group) => {
        const rangeIndex = this.getRangeValue(minMax, group.totalContributors);

        return {
          id: group.id,
          name: group.name,
          value: [group.totalContributors, rangeIndex],
          slug: group.slug,
          softwareValue: group.softwareValue,
          avgScore: group.avgScore,
          type: group.type,
          topProjects: group.topProjects.map((project) => ({
            ...project,
            logoUrl: project.logo
          })),
          topCollections: group.topCollections,
          link: `${link}/${group.slug}`,
          target: '_self'
        };
      }) || []
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
      max: min + rangeSize * (i + 1)
    }));

    // Assign range index to each item
    return ranges.findIndex((range) => value >= range.min && value <= range.max);
  }
}

export const OSS_INDEX_API_SERVICE = new OssIndexApiService();
