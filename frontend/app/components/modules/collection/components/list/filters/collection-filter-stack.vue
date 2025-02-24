<template>
  <lfx-dropdown
    v-model="value"
    :options="options"
    icon="fa-layer-group fa-light"
    type="filled"
    dropdown-position="left"
    prefix="Stack"
    placeholder="All"
    :split-lines="[1]"
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

const emit = defineEmits<{(e: 'update:modelValue', value: string): void }>();

const value = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
});

const options = computed<DropdownGroupOptions>(() => [
  {
    label: '',
    items: [
      { label: 'All Stacks', value: '' },
    ]
  },
    ...data.value,
])

const { data } = useFetch<DropdownGroupOptions>(
    () => `/api/collections/stack`
);

</script>

<script lang="ts">
export default {
  name: 'LfxCollectionFilterStack'
};
</script>
