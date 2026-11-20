<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex gap-4 items-start">
    <div class="h-[52px] w-[52px] shrink-0 rounded-xl bg-neutral-100 flex items-center justify-center">
      <lfx-icon
        :name="content.icon"
        :size="24"
        class="text-neutral-600"
      />
    </div>
    <div class="min-w-0 flex-1">
      <p class="font-semibold text-base">{{ content.title }}</p>
      <p class="text-sm text-neutral-600 mt-1 [overflow-wrap:anywhere]">{{ content.body }}</p>
      <component
        :is="content.actionHint ? 'p' : 'div'"
        v-if="content.action"
        class="mt-4"
        :class="content.actionHint ? 'text-[13px] text-neutral-600' : 'flex flex-wrap items-center gap-x-3 gap-y-2'"
      >
        {{ content.actionHint }}
        <lfx-button
          :type="content.action.type"
          :button-style="content.action.style"
          :class="content.action.class"
          @click="emit('correct')"
        >
          {{ content.action.label }}
        </lfx-button>
      </component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { displayUrl } from '~/components/modules/project/services/docs-readiness.service';
import LfxButton from '~/components/uikit/button/button.vue';
import type { ButtonStyle, ButtonType } from '~/components/uikit/button/types/button.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import type { DocsReadinessState } from '~~/types/docs-readiness/readiness.types';

interface EmptyStateContent {
  icon: string;
  title: string;
  body: string;
  actionHint?: string;
  action?: { label: string; type: ButtonType; style: ButtonStyle; class?: string };
}

const props = defineProps<{
  state: DocsReadinessState;
  repoUrl: string | null;
}>();

const emit = defineEmits<{
  (e: 'correct'): void;
}>();

const content = computed<EmptyStateContent>(() => {
  switch (props.state) {
    case 'no-docs':
      return {
        icon: 'file-magnifying-glass',
        title: 'We couldn’t find a documentation site for this project',
        body: 'We looked for llms.txt, docs subdomains and paths, package manifests, the README, the GitHub homepage, the project website and web search. If the project has docs, point us to them.',
        action: {
          label: 'Suggest a documentation URL',
          type: 'primary',
          style: 'pill',
          class: '!min-h-11 !py-0 !px-[18px] !text-[13px] !font-semibold',
        },
      };
    case 'repo-only':
      return {
        icon: 'code',
        title: 'This project’s documentation lives in its code repository',
        body: `Readiness is assessed for documentation websites only, so ${
          props.repoUrl ? displayUrl(props.repoUrl) : 'the repository'
        } isn’t scored.`,
        action: {
          label: 'Suggest a documentation website',
          type: 'tertiary',
          style: 'pill',
          class: '!min-h-11 !py-0 !px-[18px] !text-[13px] !font-semibold',
        },
      };
    case 'confirmed-no-docs':
      return {
        icon: 'file-minus',
        title: 'This project doesn’t publish a documentation site',
        body: 'The LF team confirmed this project has no documentation website to assess.',
        actionHint: 'Docs published since?',
        action: {
          label: 'Request a correction',
          type: 'transparent',
          style: 'rounded',
          class:
            '!p-0 !text-[13px] !font-semibold !text-brand-500 hover:!bg-transparent hover:underline !inline-flex !align-baseline',
        },
      };
    default:
      return {
        icon: 'clock',
        title: 'Not evaluated yet',
        body: 'New projects are evaluated within a day.',
      };
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDocsReadinessEmptyState',
};
</script>
