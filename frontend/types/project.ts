export interface ProjectRepository {
  url: string;
  name: string;
  slug: string;
}

export interface Project{
    id: string;
    name: string;
    slug: string;
    description: string;
    logo: string;
    isLF: boolean;
    contributorCount: number;
    organizationCount: number;
    repositories: ProjectRepository[];
}

export interface ProjectList{
    id: string;
    name: string;
    slug: string;
    description: string;
    logo: string;
    isLF: boolean;
    contributorCount: number;
    organizationCount: number;
    repositories: string[];
}

export interface ProjectTinybird{
    id: string;
    name: string;
    slug: string;
    description: string;
    logo: string;
    isLF: number;
    contributorCount: number;
    organizationCount: number;
    repositories: string[];
}
