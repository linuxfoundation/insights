import { LfxRoutes } from '~/components/shared/types/routes';

export interface ProjectLinkConfig {
  key: string;
  icon: string;
  label: string;
  projectRouteName: LfxRoutes;
  repoRouteName: LfxRoutes;
  comingSoon?: boolean;
}

export const lfProjectLinks: ProjectLinkConfig[] = [
  {
    key: 'overview',
    icon: 'gauge-high',
    label: 'Overview',
    projectRouteName: LfxRoutes.PROJECT,
    repoRouteName: LfxRoutes.REPOSITORY
  },
  {
    key: 'contributors',
    icon: 'people-group',
    label: 'Contributors',
    projectRouteName: LfxRoutes.PROJECT_CONTRIBUTORS,
    repoRouteName: LfxRoutes.REPOSITORY_CONTRIBUTORS
  },
  {
    key: 'popularity',
    icon: 'fire',
    label: 'Popularity',
    projectRouteName: LfxRoutes.PROJECT_POPULARITY,
    repoRouteName: LfxRoutes.REPOSITORY_POPULARITY
  },
  {
    key: 'development',
    icon: 'code',
    label: 'Development',
    projectRouteName: LfxRoutes.PROJECT_DEVELOPMENT,
    repoRouteName: LfxRoutes.REPOSITORY_DEVELOPMENT
  },
  {
    key: 'security',
    icon: 'shield-check',
    label: 'Security & Best Practices',
    projectRouteName: LfxRoutes.PROJECT_SECURITY,
    repoRouteName: LfxRoutes.REPOSITORY_SECURITY,
    comingSoon: true
  }
];
