export interface ProjectRepository {
    name: string;
}
export interface Project{
    slug: string;
    name: string;
    logo: string | null;
    repositories: ProjectRepository[];
}
