import organizationDashboard from "~/config/tools/organization-dashboard";
import individualDashboard from "~/config/tools/individual-dashboard";
import projectControlCenter from "~/config/tools/project-control-center";
import security from "~/config/tools/security";
import easycla from "~/config/tools/easy-cla";
import mentorship from "~/config/tools/mentorship";
import crowdfunding from "~/config/tools/crowdfunding";
import communityManagement from "~/config/tools/community-management";
import documentManagement from "~/config/tools/document-management";

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
    documentManagement,
}
