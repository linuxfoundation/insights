<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Package downloads
    </h3>
    <p class="text-body-2 text-neutral-500">
      Active contributor is an individual performing tasks such as commits,
      issues, or pull requests during the selected time period.
    </p>
  </lfx-card>
</template>

<script setup lang="ts">
import LfxCard from "~/components/uikit/card/card.vue";
</script>

<script lang="ts">
export default {
  name: 'LfxProjectPackageDownloads',
}
</script>
