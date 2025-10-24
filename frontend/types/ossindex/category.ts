// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Category } from '../category/category';
import type { OSSIndexTopCollection, OSSIndexTopProject } from './common';
import type { OSSIndexCollection } from './collection';

export interface OSSIndexCategoryTinybird {
  id: string;
  name: string;
  slug: string;
  totalContributors: number;
  softwareValue: number;
  avgScore: number;
  topCollections: (string | number)[][];
  topProjects: (string | number)[][];
}

export interface OSSIndexCategory {
  id: string;
  name: string;
  slug: string;
  totalContributors: number;
  softwareValue: number;
  avgScore: number;
  projectCount: number;
  topCollections: OSSIndexTopCollection[];
  topProjects: OSSIndexTopProject[];
}

export interface OSSIndexCategoryDetails extends Category {
  collections: OSSIndexCollection[];
  page: number;
  pageSize: number;
}
