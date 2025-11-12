// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { LfxRoutes } from '~/components/shared/types/routes';
import individualDashboard from '~/config/menu/tools/individual-dashboard';
import organizationDashboard from '~/config/menu/tools/organization-dashboard';
import projectControlCenter from '~/config/menu/tools/project-control-center';
import mentorship from '~/config/menu/tools/mentorship';
import crowdfunding from '~/config/menu/tools/crowdfunding';
import { useReportStore } from '~/components/shared/modules/report/store/report.store';

export interface FooterMenuLink {
  link?: string;
  route?: LfxRoutes;
  click?: () => void;
  name: string;
}

export interface FooterMenuSection {
  title: string;
  links: FooterMenuLink[];
}

export const lfxFooterMenu: FooterMenuSection[] = [
  {
    title: 'LFX Insights',
    links: [
      {
        name: 'Leaderboards',
        route: LfxRoutes.LEADERBOARDS,
      },
      {
        name: 'Collections',
        route: LfxRoutes.COLLECTIONS,
      },
      {
        name: 'Open Source Index',
        route: LfxRoutes.OPENSOURCEINDEX,
      },
      {
        name: 'Docs',
        link: '/docs/',
      },
      {
        name: 'Report issue',
        click: () => {
          const { openReportModal } = useReportStore();
          openReportModal({
            hideArea: true,
          });
        },
      },
      {
        name: 'Join discussions',
        link: 'https://github.com/linuxfoundation/insights/discussions',
      },
    ],
  },
  {
    title: 'Latest blog posts',
    links: [
      {
        name: 'Product Update November 2025',
        link: '/blog/product-update-nov-2025',
      },
      {
        name: 'The First 3 Months of Insights',
        link: '/blog/first-3-months',
      },
      {
        name: 'Introducing Insights',
        link: '/blog/introducing-insights',
      },
    ],
  },
  {
    title: 'Other LFX Tools',
    links: [
      individualDashboard,
      organizationDashboard,
      projectControlCenter,
      mentorship,
      crowdfunding,
    ],
  },
];
