<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Contributor dependency</h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      It ranks contributors based on the number of code commits, pull requests, issues closed, and
      other metrics representing their relative activity levels and impact on the project.
    </p>

    <hr>
    <section class="mt-5">
      <lfx-metric-dropdown v-model="metric" />
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxMetricDropdown from '~/components/modules/project/components/contributors/metric-dropdown.vue';

const metric = ref('all');
</script>

<script lang="ts">
export default {
  name: 'LfxProjectContributorDependency'
};
</script>
