// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface OSSIndexTopCollection {
    id: string;
    count: number;
    name: string;
    softwareValue: number;
    avgScore: number;
}

export interface OSSIndexTopProject {
    id: string;
    count: number;
    name: string;
    logo: string;
    description: string;
    softwareValue: number;
    avgScore: number;
    healthScore: number;
}
