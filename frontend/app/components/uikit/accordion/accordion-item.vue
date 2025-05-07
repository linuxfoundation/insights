<template>
  <article class="c-accordion__item">
    <div
      class="flex cursor-pointer select-none gap-4"
      :class="{'flex-row-reverse': props.reverse }"
      @click="toggle()"
    >
      <div class="flex-grow">
        <slot />
      </div>

      <lfx-icon
        name="angle-down"
        :size="16"
        class="mt-1 transition-all"
        :class="{'rotate-180': isOpen }"
      />
    </div>
    <div
      v-if="isOpen"
      :class="{'pl-8': props.reverse }"
    >
      <slot name="content" />
    </div>
  </article>
</template>

<script setup lang="ts">
import LfxIcon from "~/components/uikit/icon/icon.vue";

const props = defineProps<{
  name: string;
  reverse?: boolean;
}>()

const selectedValue = inject('selectedItem');

const isOpen = computed(() => selectedValue && selectedValue.value === props.name);

const toggle = () => {
  if(selectedValue === undefined) return;
  if(isOpen.value){
    selectedValue.value = '';
  } else {
    selectedValue.value = props.name;
  }
}
</script>

<script lang="ts">
export default {
  name: 'LfxAccordionItem'
};
</script>
