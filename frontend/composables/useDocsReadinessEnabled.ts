// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import { computed, type ComputedRef } from 'vue';

import { useAuthStore } from '~/components/modules/auth/store/auth.store';

// Strict boolean compare: env values like "1" or "yes" must not enable the flag.
export const useDocsReadinessEnabled = (): ComputedRef<boolean> => {
  const isFlagOn = useRuntimeConfig().public.docsReadinessEnabled === true;
  const { hasLfxInsightsPermission } = storeToRefs(useAuthStore());

  return computed(() => isFlagOn || hasLfxInsightsPermission.value);
};
