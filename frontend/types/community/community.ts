// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface CommunityMentionsData {
  title: string;
  body: string;
  url: string;
  timestamp: string;
  imageUrl: string;
  author: string;
  authorProfileLink: string;
  source: string;
  sourceId: string;
  relevanceScore: string;
  relevanceComment: string;
  keyword: string;
  keywords: string[];
  sentimentLabel: string;
  subreddit?: string;
  // Tinybird schema expects Int64; Octolens may send as string or number
  viewId: number | string;
  viewName: string;
  viewKeywords: string[];
  language?: string;
  bookmarked?: number;
  authorFollowerCount?: number | null;
  tags?: (string | null)[];
}
export interface OctolensWebhook {
  action: string;
  data: CommunityMentionsData;
}

export interface CommunityMentions extends CommunityMentionsData {
  projectSlug: string;
}
