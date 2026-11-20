// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from 'nuxt/app';

// Strict compare: env values like "1" or "yes" arrive non-boolean and must not enable it
export const useDocsReadinessEnabled = (): boolean =>
  useRuntimeConfig().public.docsReadinessEnabled === true;
