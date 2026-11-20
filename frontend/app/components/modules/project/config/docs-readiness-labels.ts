// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  DOCS_READINESS_CONFIDENCE_LABELS,
  DOCS_READINESS_METHOD_LABELS,
} from '~~/config/docs-readiness';

export function docsCandidateMeta(method: string | null, confidence: string | null): string {
  const methodLabel = method ? DOCS_READINESS_METHOD_LABELS[method] : undefined;
  if (method === 'override') {
    return methodLabel ?? '';
  }
  const confidenceLabel = confidence
    ? DOCS_READINESS_CONFIDENCE_LABELS[confidence]?.label
    : undefined;
  return [methodLabel, confidenceLabel].filter(Boolean).join(' · ');
}
