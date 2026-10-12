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
  slug: string;
  logo: string;
  description: string;
  softwareValue: number;
  avgScore: number;
  healthScoreV2: number | null;
  healthLabel: string | null;
  healthMaxScore: number | null;
  status: string;
}
