export interface Collection {
    name: string;
    slug: string;
    description: string;
    featuredProjects: {
      name: string;
      slug: string;
      logo: string;
    }[];
    projectsCount: number;
    softwareValueCount: number;
}
