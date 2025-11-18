// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { LfxRoutes } from '~/components/shared/types/routes';

interface MenuItem {
  label: string;
  icon?: string;
  route?: LfxRoutes;
  href?: string;
}

interface MenuConfig {
  links: MenuItem[];
  footer: MenuItem;
}

export const lfxMenu: MenuConfig = {
  links: [
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
    {
      label: 'Docs',
      icon: 'book-open',
      href: '/docs/introduction/what-is-insights/',
    },
  ],
  footer: {
    label: 'Know more about LFX Platform',
    href: 'https://lfx.linuxfoundation.org',
  },
};
