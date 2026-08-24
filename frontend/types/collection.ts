// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface CollectionFeaturedProject {
  name: string;
  slug: string;
  logo: string;
}

export type CollectionType = 'curated' | 'community' | 'my-collections' | 'liked-collections';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  isLf: boolean;
  projectCount: number;
  repositoryCount: number;
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

export interface CollectionContributorLeaderboardItem {
  id: string;
  avatar: string;
  displayName: string;
  githubHandleArray: string[];
  contributionCount: number;
}

export interface CollectionPopularityAggregate {
  totalStars: number;
  totalForks: number;
  starsPrevious365Days: number;
  forksPrevious365Days: number;
}

export interface CollectionDevelopmentAggregate {
  activeContributorsLast365Days: number;
  activeOrganizationsLast365Days: number;
}

export interface CollectionMetrics {
  projectAndRepositoryCount: number;
  // Omitted (not 0) when Tinybird is unavailable - a genuine count of 0 is distinct from
  // "unavailable," and the metrics-row UI treats undefined as "-".
  uniqueContributorCount?: number;
  avgHealthScore?: number;
}

export interface CollectionMetricsTinybird {
  projectCount: number;
  uniqueContributorCount: number;
  // Tinybird's round(avg(...)) returns SQL NULL (JSON null) when no matching rows have a health
  // score to average - a genuine "no data" case, not a score of 0.
  avgHealthScore: number | null;
}
