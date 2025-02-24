<template>
  <lfx-dropdown
    v-model="value" :options="data"
    icon="fa-buildings fa-light"
    type="filled"
    dropdown-position="left"
    prefix="Industry"
    placeholder="All"
  />
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {useFetch} from "nuxt/app";
import LfxDropdown from "~/components/uikit/dropdown/dropdown.vue";
import type {DropdownGroupOptions} from "~/components/uikit/dropdown/types/dropdown.types";

const props = defineProps<{
  modelValue: string;
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: string): void}>();

const value = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
});

const { data } = useFetch<DropdownGroupOptions>(
    () => `/api/collections/industry`
);
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionFilterIndustry'
};
</script>
