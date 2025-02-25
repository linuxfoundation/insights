export interface ProjectRepository {
    name: string;
}
export interface Project{
    slug: string;
    name: string;
    logo: string | null;
    description: string | null;
    repositories: ProjectRepository[];
    contributorsCount: number;
    organizationsCount: number;
    softwareValueCount: number;
}
