import organizationDashboard from "~/config/menu/tools/organization-dashboard";
import individualDashboard from "~/config/menu/tools/individual-dashboard";
import projectControlCenter from "~/config/menu/tools/project-control-center";
import security from "~/config/menu/tools/security";
import easycla from "~/config/menu/tools/easy-cla";
import mentorship from "~/config/menu/tools/mentorship";
import crowdfunding from "~/config/menu/tools/crowdfunding";
import communityManagement from "~/config/menu/tools/community-management";

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
}
