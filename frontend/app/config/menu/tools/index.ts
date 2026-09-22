// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import communityManagement from '~/config/menu/tools/community-management';
import crowdfunding from '~/config/menu/tools/crowdfunding';
import easycla from '~/config/menu/tools/easy-cla';
import individualDashboard from '~/config/menu/tools/individual-dashboard';
import mentorship from '~/config/menu/tools/mentorship';
import organizationDashboard from '~/config/menu/tools/organization-dashboard';
import projectControlCenter from '~/config/menu/tools/project-control-center';
import security from '~/config/menu/tools/security';

export interface ToolsItem {
  name: string;
  description: string;
  icon: string;
  link: string;
}

export const lfxTools: Record<string, ToolsItem> = {
  organizationDashboard,
  individualDashboard,
  projectControlCenter,
  security,
  easycla,
  mentorship,
  crowdfunding,
  communityManagement,
};
