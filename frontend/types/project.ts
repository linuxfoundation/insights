export interface ProjectRepository {
  url: string;
  name: string;
  slug: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  contributorCount: number;
  organizationCount: number;
  repositories: ProjectRepository[];
  isLF?: boolean;
}

export interface ProjectTinybird {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  contributorCount: number;
  organizationCount: number;
  repositories: string[];
}
