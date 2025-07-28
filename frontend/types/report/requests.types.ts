// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface ReportRequest {
    area?: string;
    description: string;
    steps: string;
    expectations: string;
    projectName?: string;
    projectSlug?: string;
    repositoryUrl?: string;
    url: string;
    widget?: string;
    pageTitle: string;
}
