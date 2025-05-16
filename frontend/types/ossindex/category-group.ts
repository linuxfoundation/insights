// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {OSSIndexTopCollection, OSSIndexTopProject} from "./common";

export interface OSSIndexCategoryGroupTinybird {
    id: string;
    name: string;
    type: string;
    slug: string;
    totalContributors: number;
    topCollections: (string | number)[][];
    topProjects: (string | number)[][];
}

export interface OSSIndexCategoryGroup {
    id: string;
    name: string;
    type: string;
    slug: string;
    totalContributors: number;
    topCollections: OSSIndexTopCollection[];
    topProjects: OSSIndexTopProject[];
}
