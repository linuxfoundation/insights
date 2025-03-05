export interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string;
    isLf: number;
    projectsCount: number;
    featuredProjects: {
        name: string;
        slug: string;
        logo: string;
    }[];
}
