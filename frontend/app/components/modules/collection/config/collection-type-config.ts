// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { LfxRoutes } from '~/components/shared/types/routes';
import type { MenuItem } from '~/config/menu';
import type { CollectionType } from '~~/types/collection';
import type { User } from '~~/types/auth/auth-user.types';

export interface CollectionTypesTabs extends MenuItem {
  type: CollectionType;
  description: string;
  detailsLabel: string;
}
export const collectionTabs = (user: User | null): CollectionTypesTabs[] => {
  const tabs: CollectionTypesTabs[] = [
    {
      label: 'Curated',
      detailsLabel: 'Curated Collections',
      icon: 'gem',
      route: LfxRoutes.COLLECTIONS_CURATED,
      activeClass: '!bg-neutral-200',
      iconHighlightClass: '!bg-neutral-900',
      type: 'curated',
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
    type: 'community',
    description: 'Discover collections from the open source community.',
  });

  if (user) {
    tabs.push({
      label: 'My Collections',
      detailsLabel: 'My Collections',
      icon: 'folder-heart',
      route: LfxRoutes.COLLECTIONS_MY_COLLECTIONS,
      activeClass: '!bg-discovery-200',
      iconHighlightClass: '!bg-discovery-500',
      type: 'my-collections',
      description: "Collections you've created or liked.",
    });
  }

  return tabs;
};

// This only applies to the collection details page header
export const headerBackground = (type?: CollectionType, curatedColor?: string | null) => {
  switch (type) {
    case 'curated':
      return {
        background: curatedColor
          ? `linear-gradient(0deg, ${curatedColor}00, ${curatedColor}0D), var(--White, #FFF)`
          : 'linear-gradient(0deg, #0F172B00, #0F172B0D), var(--White, #FFF)',
      };
    case 'community':
      return {
        background: 'linear-gradient(0deg, #009AFF00, #009AFF0D), var(--White, #FFF)',
      };
    default:
      return {
        background: 'linear-gradient(0deg, #8E51FF00, #8E51FF0D), var(--White, #FFF)',
      };
  }
};
