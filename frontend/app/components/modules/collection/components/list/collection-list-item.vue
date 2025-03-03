<template>
  <nuxt-link :to="{name: LfxRoutes.COLLECTION, params: {slug: props.collection.slug}}">
    <lfx-card class="pt-7 pl-6 pr-10 pb-8 hover:shadow-sm transition-all">
      <div class="flex -mx-2">
        <div class="w-7/12 px-2">
          <h3 class="text-heading-3 leading-7 font-secondary font-bold pb-2">
            {{ props.collection.name }}
          </h3>
          <p class="text-body-1 leading-5 text-neutral-500 pb-6">
            {{ props.collection.description }}
          </p>
          <p class="text-neutral-400 text-body-2 font-medium pb-2">
            Featured projects
          </p>
          <div
            class="flex flex-wrap gap-3"
            @click.prevent
          >
            <lfx-chip
              v-for="project of props.collection.featuredProjects"
              :key="project.slug"
              type="bordered"
            >
              <lfx-avatar
                :src="project.logo"
                size="xsmall"
                type="organization"
              />
              {{ project.name }}
            </lfx-chip>
          </div>
        </div>
        <div class="w-5/12 px-2 flex justify-end items-start">
          <div class="flex flex-wrap gap-6 justify-start">
            <article class="flex items-center gap-2">
              <div class="h-8 w-8 rounded-full flex items-center justify-center bg-brand-50">
                <lfx-icon
                  name="laptop-code"
                  :size="16"
                  class="text-brand-600"
                />
              </div>
              <p class="leading-6 transition-all text-sm">
                {{formatNumberShort(props.collection.projectsCount)}} projects
              </p>
            </article>
            <article class="flex items-center gap-2">
              <div class="h-8 w-8 rounded-full flex items-center justify-center bg-positive-50">
                <lfx-icon
                  name="dollar-circle"
                  :size="16"
                  class="text-positive-600"
                />
              </div>
              <p class="leading-6 transition-all text-sm">
                <span class="text-neutral-500">Software value:</span>
                ${{ formatNumberShort(props.collection.softwareValueCount) }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </lfx-card>
  </nuxt-link>
</template>

<script setup lang="ts">
import type {Collection} from "~/components/modules/collection/types/Collection";
import LfxCard from "~/components/uikit/card/card.vue";
import LfxChip from "~/components/uikit/chip/chip.vue";
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import {formatNumberShort} from "~/components/shared/utils/formatter";

const props = defineProps<{
  collection: Collection;
}>()

</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListItem'
}
</script>
