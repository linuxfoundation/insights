<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <lfx-project-security-evaluation-repository
      v-for="repoChecks in paginatedChecks"
      :key="repoChecks.repo"
      :checks="repoChecks.checks || []"
      :repository="repoChecks.repo"
    />

    <div
      v-if="hasNextPage"
      class="flex flex-row justify-center mb-5"
    >
      <lfx-button
        type="transparent"
        @click="loadMore"
      >
        Load more
      </lfx-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type {SecurityData} from "~~/types/security/responses.types";
import LfxProjectSecurityEvaluationRepository
  from "~/components/modules/project/components/security/evaluation-repository.vue";
import LfxButton from "~/components/uikit/button/button.vue";

type PaginatedChecks = {
  repo: string;
  checks: SecurityData[];
};

const props = defineProps<{
  groupChecks: Record<string, SecurityData[]>;
}>();

const offset = ref(0);
const itemsPerPage = ref(20);

const paginatedChecks = computed<PaginatedChecks[]>(() => {
  const end = offset.value + itemsPerPage.value;
  const checksArr = Object.entries(props.groupChecks);
  return checksArr.slice(0, end > checksArr.length ? checksArr.length : end).map(([repo, checks]) => ({
    repo,
    checks,
  }));
});

const hasNextPage = computed(() => {
  return offset.value + itemsPerPage.value < Object.keys(props.groupChecks).length;
});

const loadMore = () => {
  offset.value += itemsPerPage.value;
};

</script>
<script lang="ts">
export default {
  name: 'LfxProjectSecurityPaginatedEvalRepos',
};
</script>
