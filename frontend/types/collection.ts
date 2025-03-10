export interface CollectionFeaturedProject {
    name: string;
    slug: string;
    logo: string;
}

export interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string;
    isLf: number;
    projectCount: number;
    featuredProjects: CollectionFeaturedProject[];
}
