// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { LfxRoutes } from '~/components/shared/types/routes';

export interface CollectionLinkConfig {
  key: string;
  icon: string;
  label: string;
  routeName: LfxRoutes;
}

export const lfCollectionAggregateLinks: CollectionLinkConfig[] = [
  { key: 'projects', icon: 'layer-group', label: 'Projects', routeName: LfxRoutes.COLLECTION },
  {
    key: 'contributors',
    icon: 'people-group',
    label: 'Contributors',
    routeName: LfxRoutes.COLLECTION_CONTRIBUTORS,
  },
  {
    key: 'popularity',
    icon: 'fire',
    label: 'Popularity',
    routeName: LfxRoutes.COLLECTION_POPULARITY,
  },
  {
    key: 'development',
    icon: 'code',
    label: 'Development',
    routeName: LfxRoutes.COLLECTION_DEVELOPMENT,
  },
];
