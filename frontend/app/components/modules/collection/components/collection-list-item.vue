<template>
  <lfx-card class="pt-7 pl-6 pr-10 pb-8">
    <div class="flex -mx-2">
      <div class="w-1/2 px-2">
        <h3 class="text-heading-3 leading-7 font-secondary font-bold pb-2">
          Cloud Native Computing Foundation
        </h3>
        <p class="text-body-2 text-neutral-600 pb-6">
          Driving innovation with open-source projects for scalable, resilient cloud-native systems
        </p>
        <p class="text-neutral-400 text-body-2 font-medium pb-2">
          Featured projects
        </p>
        <div class="flex flex-wrap gap-3">
          <lfx-chip v-for="i of 3" :key="i" type="bordered">
            <lfx-avatar src="https" size="xsmall" type="organization" />
            Prometheus
          </lfx-chip>
        </div>
      </div>
      <div class="w-1/2 px-2 flex justify-end">
        <div class="flex flex-wrap gap-8 justify-start">
          <article>
            <lfx-tag type="transparent" size="small">
              <lfx-icon name="people-group" :size="12" />
              Contributors
            </lfx-tag>
            <p class="text-lg leading-7 mt-1">
              2.6K
            </p>
          </article>
          <article>
            <lfx-tag type="transparent" size="small">
              <lfx-icon name="building" :size="12" />
              Organizations
            </lfx-tag>
            <p class="text-lg leading-7 mt-1">
              2.6K
            </p>
          </article>
          <article>
            <lfx-tag type="transparent" size="small">
              <lfx-icon name="laptop-code" :size="12" />
              Projects
            </lfx-tag>
            <p class="text-lg leading-7 mt-1">
              2.6K
            </p>
          </article>
          <article>
            <lfx-tag type="transparent" size="small">
              <lfx-icon name="dollar-circle" :size="12" />
              Software value
            </lfx-tag>
            <p class="text-lg leading-7 mt-1">
              2.6K
            </p>
          </article>
        </div>
      </div>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
// import type {Collection} from "~/components/modules/collection/types/Collection";
//
// const props = defineProps<{
//   collection: Collection;
// }>()
import LfxCard from "~/components/uikit/card/card.vue";
import LfxChip from "~/components/uikit/chip/chip.vue";
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import LfxTag from "~/components/uikit/tag/tag.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListItem'
}
</script>
