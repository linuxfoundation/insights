<template>
  <article
    class="py-2 px-3 rounded-md transition hover:bg-neutral-50
          cursor-pointer flex items-center justify-between text-sm leading-5 gap-2"
  >
    <div class="flex items-center gap-2">
      <lfx-icon :name="props.icon" :size="16" class="text-neutral-400" />
      <span :class="props.selected ? 'font-medium' : 'font-normal'">{{ props.text }}</span>
    </div>
    <lfx-icon v-if="props.selected" name="check" :size="16" class="text-brand-500" />
  </article>
</template>

<script setup lang="ts">
import LfxIcon from "~/components/uikit/icon/icon.vue";

const props = defineProps<{
  text: string;
  icon: string;
  selected: boolean;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxProjectRepositorySwitchItem'
};
</script>
