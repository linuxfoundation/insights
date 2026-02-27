// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { LfxRoutes } from '~/components/shared/types/routes';
import type { MenuItem } from '~/config/menu';
import type { CollectionType } from '~~/types/collection';
import type { User } from '~~/types/auth/auth-user.types';

export interface CollectionTypesTabs extends MenuItem {
  type: CollectionType;
  detailsLabel: string;
}
export const collectionTabs = (user: User | null): CollectionTypesTabs[] => {
  return !!user?.isLfInsightsTeamMember
    ? [
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
      ]
    : [
        {
          label: 'Curated',
          detailsLabel: 'Curated Collections',
          icon: 'gem',
          route: LfxRoutes.COLLECTIONS_CURATED,
          activeClass: '!bg-neutral-200',
          iconHighlightClass: '!bg-neutral-900',
          type: 'curated',
        },
      ];
};

export const headerBackground = (type?: CollectionType) => {
  switch (type) {
    case 'curated':
      return {
        background:
          'linear-gradient(0deg, rgba(15, 23, 43, 0.00) 0%, rgba(15, 23, 43, 0.05) 100%), var(--White, #FFF)',
      };
    case 'community':
      return {
        background:
          'linear-gradient(0deg, rgba(0, 154, 255, 0.00) 0%, rgba(0, 154, 255, 0.05) 100%), var(--White, #FFF)',
      };
    default:
      return {
        background:
          'linear-gradient(0deg, rgba(142, 81, 255, 0.00) 0%, rgba(142, 81, 255, 0.05) 100%), var(--White, #FFF)',
      };
  }
};
