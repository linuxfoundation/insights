// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {LfxRoutes} from '~/components/shared/types/routes';
import {WidgetArea} from "~/components/modules/widget/types/widget-area";

export interface ProjectLinkConfig {
  key: string;
  icon: string;
  label: string;
  projectRouteName: LfxRoutes;
  repoRouteName: LfxRoutes;
  area: WidgetArea;
  comingSoon?: boolean;
}

export const lfProjectLinks: ProjectLinkConfig[] = [
  {
    key: 'overview',
    icon: 'gauge-high',
    label: 'Overview',
    area: WidgetArea.OVERVIEW,
    projectRouteName: LfxRoutes.PROJECT,
    repoRouteName: LfxRoutes.REPOSITORY
  },
  {
    key: 'contributors',
    icon: 'people-group',
    label: 'Contributors',
    area: WidgetArea.CONTRIBUTORS,
    projectRouteName: LfxRoutes.PROJECT_CONTRIBUTORS,
    repoRouteName: LfxRoutes.REPOSITORY_CONTRIBUTORS
  },
  {
    key: 'popularity',
    icon: 'fire',
    label: 'Popularity',
    area: WidgetArea.POPULARITY,
    projectRouteName: LfxRoutes.PROJECT_POPULARITY,
    repoRouteName: LfxRoutes.REPOSITORY_POPULARITY
  },
  {
    key: 'development',
    icon: 'code',
    label: 'Development',
    area: WidgetArea.DEVELOPMENT,
    projectRouteName: LfxRoutes.PROJECT_DEVELOPMENT,
    repoRouteName: LfxRoutes.REPOSITORY_DEVELOPMENT
  },
  {
    key: 'security',
    icon: 'shield-check',
    label: 'Security & Best Practices',
    area: WidgetArea.SECURITY,
    projectRouteName: LfxRoutes.PROJECT_SECURITY,
    repoRouteName: LfxRoutes.REPOSITORY_SECURITY,
  }
];
