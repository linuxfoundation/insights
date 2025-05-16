// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {OSSIndexTopCollection, OSSIndexTopProject} from "./common";

export interface OSSIndexCategoryTinybird {
    id: string;
    name: string;
    slug: string;
    totalContributors: number;
    topCollections: (string | number)[][];
    topProjects: (string | number)[][];
}

export interface OSSIndexCategory {
    id: string;
    name: string;
    slug: string;
    totalContributors: number;
    topCollections: OSSIndexTopCollection[];
    topProjects: OSSIndexTopProject[];
}
