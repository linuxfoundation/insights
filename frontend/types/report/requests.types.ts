export interface ReportRequest {
    area: string;
    description: string;
    email?: string;
    projectName?: string;
    projectSlug?: string;
    repositoryUrl?: string;
    url: string;
    widget?: string;
}
