<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    width="720px"
    height="85vh"
    type="cover"
    content-class="!overflow-hidden h-[85vh] mt-11"
  >
    <div class="p-5 flex flex-col h-full">
      <div class="flex items-center justify-between shrink-0">
        <h1>Controls assessment breakdown</h1>

        <lfx-icon-button
          icon="close"
          size="small"
          :icon-size="12"
          @click="isModalOpen = false"
        />
      </div>

      <div class="mt-8 shrink-0">
        <lfx-tabs
          :tabs="viewTabs"
          :model-value="selectedTab"
          tab-style="pill"
          @update:model-value="selectedTab = $event"
        >
          <template #slotItem="{ option }">
            <div class="flex items-center gap-2 -mx-1">
              {{ option.label }}
            </div>
          </template>
        </lfx-tabs>
        <p
          v-if="config"
          class="text-body-2 text-neutral-500 my-5"
        >
          {{ config.description }}
        </p>
      </div>

      <div class="overflow-y-auto flex-1 min-h-0">
        <lfx-project-security-paginated-eval-repos :group-checks="groupChecksByRepository(selectedChecks || [])" />
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxModal from '~/components/uikit/modal/modal.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import type { SecurityData } from '~~/types/security/responses.types';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import { lfxSecurityCategories } from '~/components/modules/project/config/security-category';
import LfxProjectSecurityPaginatedEvalRepos from '~/components/modules/project/components/security/paginated-eval-repos.vue';
import { PROJECT_SECURITY_SERVICE } from '~/components/modules/project/services/security.service';

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:currentTab', value: string): void;
}>();

const props = defineProps<{
  modelValue: boolean;
  currentTab: string;
  checksGroup: Record<string, SecurityData[]>;
}>();

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});
const selectedTab = computed({
  get: () => props.currentTab,
  set: (value: string) => emit('update:currentTab', value),
});

const selectedChecks = computed(() => {
  return props.checksGroup[props.currentTab] || [];
});
const category = computed(() => selectedChecks.value[0]?.category);
const config = computed(() => category.value && lfxSecurityCategories[category.value]);

const viewTabs = computed(() => {
  return Object.keys(props.checksGroup).map((key) => ({
    label: key,
    value: key,
  }));
});

const groupChecksByRepository = (checks: SecurityData[]) =>
  (checks || []).reduce(
    (mapping, check) => {
      const obj = { ...mapping };
      if (!obj[check.repo]) {
        obj[check.repo] = [];
      }
      const tmpAssessments = PROJECT_SECURITY_SERVICE.orderAssessmentsByRequirementId(
        PROJECT_SECURITY_SERVICE.mergeDuplicateAssessments(check.assessments),
      );
      // Create a copy of the check object to avoid mutating the original
      const checkCopy = {
        ...check,
        assessments: tmpAssessments,
      };
      obj[check.repo]?.push(checkCopy);
      return obj;
    },
    {} as Record<string, SecurityData[]>,
  );
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityReposEvalModal',
};
</script>
