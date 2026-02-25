// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { LfxRoutes } from '~/components/shared/types/routes';
import type { MenuItem } from '~/config/menu';
import type { CollectionType } from '~~/types/collection';

export interface CollectionTypesTabs extends MenuItem {
  type: CollectionType;
  detailsLabel: string;
}
export const collectionTabs: CollectionTypesTabs[] = [
  {
    label: 'Curated',
    detailsLabel: 'Curated Collections',
    icon: 'gem',
    route: LfxRoutes.COLLECTIONS_CURATED,
    activeClass: '!bg-neutral-200',
    iconHighlightClass: '!bg-neutral-900',
    type: 'curated',
  },
  {
    label: 'Community',
    detailsLabel: 'Community Collections',
    icon: 'globe',
    route: LfxRoutes.COLLECTIONS_COMMUNITY,
    activeClass: '!bg-accent-200',
    iconHighlightClass: '!bg-accent-500',
    type: 'community',
  },
  {
    label: 'My Collections',
    detailsLabel: 'My Collections',
    icon: 'folder-heart',
    route: LfxRoutes.COLLECTIONS_MY_COLLECTIONS,
    activeClass: '!bg-discovery-200',
    iconHighlightClass: '!bg-discovery-500',
    type: 'my-collections',
  },
];
