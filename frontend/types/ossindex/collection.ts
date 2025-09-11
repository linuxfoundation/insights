// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {OSSIndexTopProject} from "./common";

export interface OSSIndexCollectionTinybird {
    id: string;
    name: string;
    slug: string;
    totalContributors: number;
    softwareValue: number;
    avgScore: number;
    topProjects: (string | number)[][];
}

export interface OSSIndexCollection {
    id: string;
    name: string;
    slug: string;
    totalContributors: number;
    softwareValue: number;
    projectCount: number;
    avgScore: number;
    topProjects: OSSIndexTopProject[];
}
