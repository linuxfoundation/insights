<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex items-center gap-1">
    <lfx-toggle
      v-model="includeCollaborations"
      size="small"
    >
      Include collaborations
    </lfx-toggle>
    <lfx-tooltip>
      <template #content>
        <p>
          Collaborations refer to activities associated with engagement or<br />coordination with others, and don't
          reflect technical-driven<br />impact.
          <a
            :href="links.collaborationDocs"
            target="_blank"
            class="text-brand-500"
            >Learn more</a
          >
        </p>
      </template>
      <lfx-icon
        name="question-circle"
        :size="13"
        class="text-neutral-400"
      />
    </lfx-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import LfxToggle from '~/components/uikit/toggle/toggle.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { links } from '~/config/links';

const props = defineProps<{
  modelValue: Record<string, unknown>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, unknown>): void;
}>();

const includeCollaborations = computed({
  get: () => props.modelValue.includeCollaborations ?? false,
  set: (value: boolean) => {
    emit('update:modelValue', {
      ...props.modelValue,
      includeCollaborations: value,
    });
  },
});
</script>

<script lang="ts">
export default {
  name: 'LfxWidgetFilterCollaboration',
};
</script>
