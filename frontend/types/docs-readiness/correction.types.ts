// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export interface DocsCorrectionCandidate {
  url: string;
  // Raw discovery method/confidence values; the labels live with the UI.
  method: string | null;
  confidence: string | null;
  isCurrent: boolean;
}

export interface DocsCorrectionOverride {
  // null means the LF team confirmed the project has no docs.
  docsUrl: string | null;
  submittedAt: string;
}

export interface DocsCorrectionContext {
  currentDocsUrl: string | null;
  candidates: DocsCorrectionCandidate[];
  override: DocsCorrectionOverride | null;
}
