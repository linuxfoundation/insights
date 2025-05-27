// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {CategoryGroup} from "../category/category-group";
import type {OSSIndexTopCollection, OSSIndexTopProject} from "./common";
import type {OSSIndexCategory} from "./category";

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

export interface OSSIndexCategoryGroupDetails extends CategoryGroup{
    categories: OSSIndexCategory[];
}
