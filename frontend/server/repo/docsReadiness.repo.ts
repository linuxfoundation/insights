// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';

import type {
  DocsCorrectionCandidate,
  DocsCorrectionContext,
} from '~~/types/docs-readiness/correction.types';

interface StoredCandidate {
  url: string;
  method: string;
  confidence: string;
  livenessOk: boolean;
}

interface CurrentDocs {
  docsUrl: string | null;
  method: string | null;
  confidence: string | null;
}

const REPO_URL_METHOD = 'repo-url';

// Mirrors the docs readiness worker's normalizeUrl.
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    const href = parsed.toString();
    return parsed.pathname !== '/' && href.endsWith('/') ? href.slice(0, -1) : href;
  } catch {
    return url;
  }
}

export function buildCorrectionCandidates(
  candidates: StoredCandidate[] | null,
  current: CurrentDocs,
): { currentDocsUrl: string | null; candidates: DocsCorrectionCandidate[] } {
  const currentDocsUrl = current.method === REPO_URL_METHOD ? null : current.docsUrl;

  const listed = (candidates ?? [])
    .filter((c) => c.livenessOk && c.method !== REPO_URL_METHOD)
    .map((c) => ({ url: c.url, method: c.method, confidence: c.confidence, isCurrent: false }));

  if (!currentDocsUrl) {
    return { currentDocsUrl: null, candidates: listed };
  }

  const currentKey = normalizeUrl(currentDocsUrl);
  return {
    currentDocsUrl,
    candidates: [
      {
        url: currentDocsUrl,
        method: current.method,
        confidence: current.confidence,
        isCurrent: true,
      },
      ...listed.filter((c) => normalizeUrl(c.url) !== currentKey),
    ],
  };
}

export class DocsReadinessRepository {
  constructor(private pool: Pool) {}

  async findCorrectionContextBySlug(slug: string): Promise<DocsCorrectionContext | null> {
    const result = await this.pool.query(
      `
        SELECT
          d."candidates",
          r."docsUrl"         AS "currentDocsUrl",
          r."discoveryMethod" AS "currentMethod",
          r."confidence"      AS "currentConfidence",
          o."docsUrl"         AS "overrideDocsUrl",
          o."submittedAt"     AS "overrideSubmittedAt"
        FROM "insightsProjects" p
        LEFT JOIN "projectDocDiscoveries" d ON d."projectId" = p.id
        LEFT JOIN LATERAL (
          SELECT "docsUrl", "discoveryMethod", "confidence"
          FROM "projectDocReadiness"
          WHERE "projectId" = p.id
          ORDER BY "runDate" DESC
          LIMIT 1
        ) r ON TRUE
        LEFT JOIN "projectDocOverrides" o ON o."projectId" = p.id AND o."active"
        WHERE p.slug = $1 AND p."deletedAt" IS NULL
      `,
      [slug],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...buildCorrectionCandidates(row.candidates, {
        docsUrl: row.currentDocsUrl,
        method: row.currentMethod,
        confidence: row.currentConfidence,
      }),
      override: row.overrideSubmittedAt
        ? {
            docsUrl: row.overrideDocsUrl,
            submittedAt: new Date(row.overrideSubmittedAt).toISOString(),
          }
        : null,
    };
  }
}
