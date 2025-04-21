<template>
  <div
    class="lfx-table"
    :class="props.showFullList ? 'h-full pb-4 sm:pb-6' : ''"
  >
    <div
      class="lfx-table-header"
      :class="props.showFullList ? 'px-4 sm:px-6' : ''"
    >
      <div class="flex flex-row gap-3 items-center">
        <div
          v-if="props.showFullList"
          class="mr-1"
        >
          #
        </div>
        Contributor
      </div>
      <div>Total contributions</div>
    </div>

    <lfx-scrollable-shadow  :class="props.showFullList ? 'px-4 sm:px-6 overflow-y-auto' : ''">
      <div
        v-for="(contributor, index) in props.contributors"
        :key="index"
        class="lfx-table-row"
      >
        <div class="flex flex-row gap-3 items-center">
          <div
            v-if="props.showFullList"
            class="mr-1 text-neutral-400"
          >
            {{ index + 1 }}
          </div>
          <lfx-avatar
            :src="contributor.avatar"
            type="member"
          />
          <div>
            {{ contributor.name }}
          </div>
        </div>
        <div>
          {{ formatNumber(contributor.contributions) }}
          <span v-if="props.showPercentage"> - {{ contributor.percentage }}% </span>
        </div>
      </div>
      <div
        v-if="showLoadMore"
        class="lfx-table-row"
      >
        <div
          ref="loadMore"
          class="flex flex-row gap-2 items-center justify-center w-full"
        >
          <span>
            <lfx-spinner
              :size="16"
              class="text-brand-300"
              :type="'light'"
            />
          </span>
          <span class="text-sm text-brand-300 text-sm font-semibold">
            Loading contributors
          </span>
        </div>
      </div>
    </lfx-scrollable-shadow>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import LfxScrollableShadow from '~/components/uikit/scrollable-shadow/scrollable-shadow.vue';
import type { Contributor } from '~~/types/contributors/responses.types';
import { formatNumber } from '~/components/shared/utils/formatter';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';

const emit = defineEmits<{(e: 'loadMore'): void
}>();

const loadMore = ref(null);
const props = withDefaults(
  defineProps<{
    metric: string;
    contributors: Contributor[];
    showPercentage?: boolean;
    showFullList?: boolean;
    total?: number;
  }>(),
  {
    showPercentage: false,
    showFullList: false,
    total: 0
  }
);

const showLoadMore = computed(() => props.total && props.total > props.contributors.length && props.showFullList);

const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0
};

const handleIntersectCallback = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      emit('loadMore');
    }
  });
}

onMounted(() => {
  if (loadMore.value) {
    const observer = new IntersectionObserver(handleIntersectCallback, options);
    observer.observe(loadMore.value);
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxContributorsTable'
};
</script>
