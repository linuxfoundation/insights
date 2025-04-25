<template>
  <div class="container !px-5 lg:!px-10">
    <div class="flex justify-between pt-5 md:pt-10 gap-10 flex-col md:flex-row">
      <div class="w-full md:w-3/4 pb-6 md:pb-10 flex flex-col gap-8">
        <div>
          <lfx-project-trust-score />
        </div>
        <div>
          <lfx-project-score-tabs />
        </div>
      </div>
      <div class="pr-5 min-w-50 xl:pr-10 max-md:w-full w-1/4">
        <lfx-project-about-section />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxProjectAboutSection from '~/components/modules/project/components/overview/about-section.vue';
import LfxProjectScoreTabs from '~/components/modules/project/components/overview/score-tabs.vue';
import LfxProjectTrustScore from '~/components/modules/project/components/overview/trust-score.vue';

</script>

<script lang="ts">
export default {
  name: 'LfxProjectOverviewView',
}
</script>
