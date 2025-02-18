export interface Collection {
    name: string;
    slug: string;
    description: string;
    featuredProjects: {
      name: string;
      slug: string;
      logo: string;
    }[];
    contributorsCount: number;
    organizationsCount: number;
    projectsCount: number;
    softwareValueCount: number;
}
