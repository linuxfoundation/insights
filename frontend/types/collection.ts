// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface CollectionFeaturedProject {
  name: string;
  slug: string;
  logo: string;
}

export type CollectionType = 'curated' | 'community' | 'my-collections';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  isLf: boolean;
  projectCount: number;
  featuredProjects: CollectionFeaturedProject[];
  softwareValue?: number;
  contributorCount?: number;
  updatedAt: string;
  owner?: {
    name: string;
    logo: string;
  };
  projects?: string[];
  imgUrl?: string;
  coverImgUrl?: string;
  gradient?: [string, string];
  type?: CollectionType;
  isLiked?: boolean;
  likeCount?: number;
  isPrivate?: boolean;
  ssoUserId?: string | null;
}
