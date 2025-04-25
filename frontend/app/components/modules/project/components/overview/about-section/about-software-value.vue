<template>
  <div class="flex flex-col gap-2 text-xs">
    <div class="text-neutral-400 font-semibold">
      About
    </div>
    <div class="text-neutral-900">
      Project description here
    </div>
  </div>
  <div class="flex flex-col gap-2 text-xs">
    <div class="text-neutral-400 font-semibold flex items-center gap-1">
      Software value
      <lfx-tooltip
        content="Software value"
        placement="top"
      >
        <lfx-icon name="question-circle" />
      </lfx-tooltip>
    </div>
    <div class="text-neutral-900">
      $321,6M
    </div>
  </div>
  <div class="flex flex-col gap-3 text-xs">
    <div class="text-neutral-400 font-semibold flex items-center gap-1">
      Maturity status
      <lfx-tooltip
        content="Maturity status"
        placement="top"
      >
        <lfx-icon name="question-circle" />
      </lfx-tooltip>
    </div>
    <div>
      <lfx-tag
        :size="'small'"
        :style="'info'"
        type="outline"
        class="justify-center"
      >
        Incubating
      </lfx-tag>
    </div>

  </div>
</template>

<script setup lang="ts">
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSection'
};
</script>
