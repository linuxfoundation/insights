<template>
  <div :class="`w-full h-[${props.height}px]`">
    <slot v-if="props.status === 'success' && !props.isEmpty" />
    <div
      v-else-if="props.status === 'pending'"
      class="flex flex-col items-center justify-center h-full"
    >
      <div class="h-10 w-full">
        <lfx-spinner
          :size="40"
          class="text-neutral-300"
          :type="'light'"
        />
      </div>
      <span class="text-sm text-neutral-500 mt-5">
        Loading data...
      </span>
    </div>
    <div
      v-else
      class="flex flex-col items-center justify-center h-full"
    >
      <lfx-icon
        name="eyes"
        :size="40"
        class="text-neutral-300"
      />
      <p class="text-sm text-neutral-500 mt-5">
        No data available
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// import type { FetchError } from 'ofetch';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import { watch } from 'vue';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = withDefaults(defineProps<{
  status: AsyncDataRequestStatus;
  isEmpty?: boolean;
  height?: number;
  errorMessage?: string;
  error?: unknown;
}>(), {
  height: 330,
  errorMessage: 'Error fetching data',
  error: undefined
});

const { showToast } = useToastService();

watch(() => props.error, (err) => {
  if (err) {
    setTimeout(() => {
      showToast(
        `${props.errorMessage}`,
        ToastTypesEnum.negative,
        undefined,
        10000
      );
    }, 500);
  }
}, { immediate: true });
</script>

<script lang="ts">
export default {
  name: 'LfxProjectLoadState'
};
</script>
