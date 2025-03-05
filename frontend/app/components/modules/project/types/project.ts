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
    contributorsCount: number;
    organizationsCount: number;
    repositories: ProjectRepository[];
}
