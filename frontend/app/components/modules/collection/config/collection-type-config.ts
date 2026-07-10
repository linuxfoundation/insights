// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { LfxRoutes } from '~/components/shared/types/routes';
import type { MenuItem } from '~/config/menu';
import type { CollectionType } from '~~/types/collection';
import type { User } from '~~/types/auth/auth-user.types';

export enum CollectionTypeEnum {
  CURATED = 'curated',
  COMMUNITY = 'community',
  MY_COLLECTIONS = 'my-collections',
}

export interface CollectionTypesTabs extends MenuItem {
  type: CollectionType;
  description: string;
  detailsLabel: string;
}
export const collectionTabs = (_user?: User | null): CollectionTypesTabs[] => {
  const tabs: CollectionTypesTabs[] = [
    {
      label: 'Curated',
      detailsLabel: 'Curated Collections',
      icon: 'gem',
      route: LfxRoutes.COLLECTIONS_CURATED,
      activeClass: '!bg-neutral-200',
      iconHighlightClass: '!bg-neutral-900',
      type: CollectionTypeEnum.CURATED,
      description: 'Hand-picked collections from The Linux Foundation.',
    },
  ];

  tabs.push({
    label: 'Community',
    detailsLabel: 'Community Collections',
    icon: 'globe',
    route: LfxRoutes.COLLECTIONS_COMMUNITY,
    activeClass: '!bg-accent-200',
    iconHighlightClass: '!bg-accent-500',
    type: CollectionTypeEnum.COMMUNITY,
    description: 'Discover collections from the open source community.',
  });

  tabs.push({
    label: 'My Collections',
    detailsLabel: 'My Collections',
    icon: 'folder-heart',
    route: LfxRoutes.COLLECTIONS_MY_COLLECTIONS,
    activeClass: '!bg-discovery-200',
    iconHighlightClass: '!bg-discovery-500',
    type: CollectionTypeEnum.MY_COLLECTIONS,
    description: "Collections you've created or liked.",
  });

  return tabs;
};

// This only applies to the collection details page header.
// Collections v2 (IN-1194): headers use a plain, consistent background — no gradient — on every collection type.
export const headerBackground = () => ({
  background: 'var(--White, #FFF)',
});
