<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <nuxt-link :to="{name: LfxRoutes.COLLECTION, params: {slug: props.collection.slug}}">
    <lfx-card class="p-5 md:p-6 hover:shadow-sm transition-all">
      <div class="flex justify-between flex-col md:flex-row items-start gap-4">
        <div>
          <h3 class="text-heading-3 leading-7 font-secondary font-bold pb-2">
            {{ props.collection.name }}
          </h3>
          <p class="text-body-1 leading-5 text-neutral-500">
            {{ props.collection.description }}
          </p>
        </div>

        <div class="flex gap-x-5 md:gap-x-6 gap-y-2 justify-start flex-wrap sm:flex-nowrap">
          <article class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-full flex items-center justify-center bg-brand-50">
              <lfx-icon
                name="laptop-code"
                :size="16"
                class="text-brand-600"
              />
            </div>
            <p class="leading-6 transition-all text-sm whitespace-nowrap">
              {{ formatNumberShort(props.collection.projectCount) }}
              {{ pluralize('project', props.collection.projectCount) }}
            </p>
          </article>
          <lfx-tooltip
            v-if="props.collection.softwareValue"
            :content="
              `Aggregated software value of $${
                formatNumberShort(props.collection.softwareValue)
              } according to COCOMO`"
          >
            <article
              v-if="props.collection.softwareValue"
              class="flex items-center gap-2"
            >
              <div class="h-8 w-8 rounded-full flex items-center justify-center bg-positive-50">
                <lfx-icon
                  name="dollar-circle"
                  :size="16"
                  class="text-positive-600"
                />
              </div>
              <p class="leading-6 transition-all text-sm whitespace-nowrap">
                ${{ formatNumberShort(props.collection.softwareValue) }}
              </p>
            </article>
          </lfx-tooltip>
        </div>
      </div>

      <section
        v-if="props.collection.featuredProjects.length > 0"
        class="pt-4 md:pt-6"
      >
        <p class="text-neutral-400 text-body-2 font-medium pb-2">
          Featured projects
        </p>
        <div
          class="flex flex-wrap gap-3"
        >
          <lfx-chip
            v-for="project of props.collection.featuredProjects"
            :key="project.slug"
            type="bordered"
            class="transition hover:bg-neutral-100"
            @click.prevent="router.push({name: LfxRoutes.PROJECT, params: {slug: project.slug}})"
          >
            <lfx-avatar
              :src="project.logo"
              size="xsmall"
              type="organization"
            />
            {{ project.name }}
          </lfx-chip>
        </div>
      </section>

    </lfx-card>
  </nuxt-link>
</template>

<script setup lang="ts">
import {useRouter} from "nuxt/app";
import pluralize from "pluralize";
import type {Collection} from "~~/types/collection";
import LfxCard from "~/components/uikit/card/card.vue";
import LfxChip from "~/components/uikit/chip/chip.vue";
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import {formatNumberShort} from "~/components/shared/utils/formatter";
import LfxTooltip from "~/components/uikit/tooltip/tooltip.vue";

const props = defineProps<{
  collection: Collection;
}>()

const router = useRouter();

</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListItem'
}
</script>
