// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export const docsDiscoveryMethodLabels: Record<string, string> = {
  'llms-txt-probe': 'Found via its llms.txt',
  'docs-subdomain': 'Found at a docs subdomain',
  'docs-path': 'Found at a /docs path',
  'package-manifest': 'Listed in the package manifest',
  'readme-scrape': 'Linked from the README',
  'github-homepage': 'Set as the GitHub repository homepage',
  serp: 'Found via web search',
  'project-website': 'Project website',
  'repo-url': 'Code repository',
  override: 'Confirmed by LF team',
};

export const docsConfidenceLabels: Record<string, string> = {
  authoritative: 'Confirmed',
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
};

export function docsCandidateMeta(method: string | null, confidence: string | null): string {
  const methodLabel = method ? docsDiscoveryMethodLabels[method] : undefined;
  if (method === 'override') {
    return methodLabel ?? '';
  }
  const confidenceLabel = confidence ? docsConfidenceLabels[confidence] : undefined;
  return [methodLabel, confidenceLabel].filter(Boolean).join(' · ');
}
