export interface ProjectRepository {
    projectId: string;
    projectName: string;
    projectSlug: string;
    repo: string;
    name: string;
}
export interface Project{
    id: string;
    name: string;
    slug: string;
    description: string;
    logo: string;
    contributorCount: number;
    organizationCount: number;
    repositories: ProjectRepository[];
}
