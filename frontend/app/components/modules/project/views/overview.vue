<template>
  <div class="container">
    <div class="flex justify-between pt-12">
      <div class="w-1/4 pr-10">
        About
      </div>
      <div class="flex-grow">
        <lfx-card class="p-5">
          <h3 class="text-heading-3 font-semibold font-secondary">
            Criteria evaluation
          </h3>
        </lfx-card>
      </div>
      <div class="w-12 ml-10">
        <lfx-card class="w-12 h-12 !rounded-full flex items-center justify-center">
          <lfx-icon
            name="link"
            :size="20"
          />
        </lfx-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxCard from "~/components/uikit/card/card.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
</script>

<script lang="ts">
export default {
  name: 'LfxProjectOverviewView',
}
</script>
