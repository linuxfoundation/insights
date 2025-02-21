<template>
  <ul class="lfx-side-nav sticky top-[220px] flex flex-col gap-4">
    <li v-for="item in props.list" :key="item.label">
      <a :href="`#${item.key}`" :class="{ active: activeItem === item.key }" @click="onClick(item.key, $event)">{{
        item.label }}</a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { SideNavItem } from './types/side-nav.types';

const props = defineProps<{
  list: SideNavItem[];
  modelValue: string;
}>();
const router = useRouter();

const emit = defineEmits<{(e: 'update:modelValue', value: string): void }>();

const activeItem = computed<string>({
  get() {
    return props.modelValue;
  },
  set(value: string) {
    emit('update:modelValue', value);
  }
});

const onClick = (value: string, e: Event) => {
  activeItem.value = value;
  e.preventDefault();
  e.stopPropagation();

  router.replace({
    hash: `#${value}`
  });
};
</script>

<script lang="ts">
export default {
  name: 'LfxSideNav'
};
</script>
