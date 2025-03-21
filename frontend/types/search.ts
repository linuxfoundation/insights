export interface SearchCollection {
    name: string;
    slug: string;
}

export interface SearchProject {
    name: string;
    slug: string;
    logo: string | null;
}

export interface SearchRepository {
    name: string;
    slug: string;
    projectSlug: string;
}

export interface SearchResults {
    projects: SearchProject[];
    repositories: SearchRepository[];
    collections: SearchCollection[];
}
