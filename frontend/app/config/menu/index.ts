// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { LfxRoutes } from '~/components/shared/types/routes';

export interface MenuItem {
  label: string;
  icon?: string;
  route?: LfxRoutes;
  href?: string;
  activeClass?: string;
  iconHighlightClass?: string;
}

interface MenuConfig {
  links: MenuItem[];
  footer: MenuItem;
}

export const lfxMenu: MenuConfig = {
  links: [
    // {
    //   label: 'Collections',
    //   icon: 'rectangle-history',
    //   // TODO: Change this to collections only when the discovery page is ready
    //   route: LfxRoutes.COLLECTIONS_CURATED,
    // },
    {
      label: 'Leaderboards',
      icon: 'trophy',
      route: LfxRoutes.LEADERBOARDS,
    },
    {
      label: 'Open Source Index',
      icon: 'globe',
      route: LfxRoutes.OPENSOURCEINDEX,
    },
  ],
  footer: {
    label: 'Know more about LFX Platform',
    href: 'https://lfx.linuxfoundation.org',
  },
};
