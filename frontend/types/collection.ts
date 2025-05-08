// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
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
