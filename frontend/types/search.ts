// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
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
    archived: boolean;
    excluded: boolean;
}

export interface SearchResults {
    projects: SearchProject[];
    repositories: SearchRepository[];
    collections: SearchCollection[];
}
