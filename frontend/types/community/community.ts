// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface OctolensWebhookData {
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
  sentimentLabel: string;
  subreddit?: string;
  viewId: string;
  viewName: string;
}
export interface OctolensWebhook {
  action: string;
  data: OctolensWebhookData;
}
