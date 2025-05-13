<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <nuxt-link
    :to="{name: LfxRoutes.PROJECT, params: {slug: props.project.slug}}"
    class="flex flex-col"
    :class="{
      'pointer-events-none': projectNotOnboarded,
    }"
  >
    <lfx-card class="p-5 md:p-6 flex flex-col transition-all hover:shadow-sm h-full">
      <div
        :class="{
          'opacity-50': projectNotOnboarded,
        }"
      >
        <lfx-organization-logo
          :src="props.project.logo || ''"
          size="large"
          :is-lf="props.project.isLF"
        />
        <h3 class="text-heading-3 font-bold font-secondary pt-4 line-clamp-1">
          {{ props.project.name }}
        </h3>
        <p class="pt-3 text-body-1 text-neutral-500 line-clamp-2">
          {{ props.project.description }}
        </p>
      </div>
      <div class="flex-grow" />
      <div
        class="pt-5 flex flex-col gap-2"
      >
        <div v-if="!projectNotOnboarded">
          <article class="flex justify-between items-center">
            <lfx-tag
              type="transparent"
              size="medium"
            >
              <lfx-icon
                name="people-group"
                :size="14"
              />
              Contributors
            </lfx-tag>
            <p class="text-body-1">
              {{formatNumber(props.project.contributorCount)}}
            </p>
          </article>
          <article class="flex justify-between items-center">
            <lfx-tag
              type="transparent"
              size="medium"
            >
              <lfx-icon
                name="building"
                :size="14"
              />
              Organizations
            </lfx-tag>
            <p class="text-body-1">
              {{formatNumber(props.project.organizationCount)}}
            </p>
          </article>
        </div>
        <!--<article class="flex justify-between items-center">-->
        <!--  <lfx-tag-->
        <!--    type="transparent"-->
        <!--    size="medium"-->
        <!--  >-->
        <!--    <lfx-icon-->
        <!--      name="dollar-circle"-->
        <!--      :size="14"-->
        <!--    />-->
        <!--    Software value-->
        <!--  </lfx-tag>-->
        <!--  <p class="text-body-1">-->
        <!--    ${{formatNumberShort(props.project.softwareValueCount)}}-->
        <!--  </p>-->
        <!--</article>-->
        <div
          v-else
          class="text-body-1 text-neutral-500"
        >
          There is no data available for this project yet.
        </div>
      </div>
    </lfx-card>
  </nuxt-link>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type {Project} from "~~/types/project";
import {formatNumber} from "~/components/shared/utils/formatter";
import LfxCard from "~/components/uikit/card/card.vue";
import LfxTag from "~/components/uikit/tag/tag.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import LfxOrganizationLogo from "~/components/uikit/organization-logo/organization-logo.vue";

const props = defineProps<{
  project: Project
}>()

const projectNotOnboarded = computed(() => !props.project.contributorCount && !props.project.organizationCount);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectListItem'
}
</script>
