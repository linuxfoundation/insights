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
  logoUrl?: string | null;
  imageUrl?: string | null;
  coverImgUrl?: string;
  color?: string | null;
  type?: CollectionType;
  isLiked?: boolean;
  isPrivate?: boolean;
  ssoUserId?: string | null;
  likeCount?: number;
}
