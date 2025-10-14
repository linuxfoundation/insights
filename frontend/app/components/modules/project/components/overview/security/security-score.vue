<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <div class="flex flex-col lg:flex-row justify-between lg:items-end pb-8 gap-5 lg:gap-20">
      <div>
        <h2 class="text-heading-3 font-secondary font-bold">
          Controls assessment
        </h2>
        <p
          class="text-xs text-neutral-500 mt-4"
        >
          Process of assessing a project's practices, policies, and technical measures against a set
          of predefined standards to determine its security posture, reliability, and maturity.
          <a
            :href="links.securityScore"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-500"
          >Learn more</a>
        </p>
      </div>

      <nuxt-link :to="{name: name ? LfxRoutes.REPOSITORY_SECURITY : LfxRoutes.PROJECT_SECURITY}">
        <lfx-button
          type="tertiary"
          size="small"
          class="w-[195px] !text-xs mb-1"
        >
          <lfx-icon name="arrow-up-right" />
          Assessment breakdown
        </lfx-button>
      </nuxt-link>
    </div>
    <section class="flex flex-col gap-4">
      <article
        v-for="(score) in data"
        :key="score.category"
        class="[&:not(:last-child)]:border-b border-neutral-100 [&:not(:last-child)]:pb-4"
      >
        <div class="flex flex-row items-start gap-4">
        
          <div class="h-12 w-12 min-w-12">
            <lfx-chart :config="categoryChartConfig(score.percentage)" />
          </div>
          <div class="flex-grow">
            <h3 class="text-sm leading-5 font-semibold">
              {{ score.category}}
            </h3>
            <p
              v-if="categoryConfig(score.category)"
              class="text-body-2 text-neutral-500 mt-1"
            >
              {{ categoryConfig(score.category)?.description }}
            </p>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script lang="ts" setup>
import {useRoute} from "nuxt/app";
import type {SecurityDataCategory} from "~~/types/security/responses.types";
import {lfxColors} from "~/config/styles/colors";
import LfxChart from "~/components/uikit/chart/chart.vue";
import {getGaugeChartConfig} from "~/components/uikit/chart/configs/gauge.chart";
import {links} from "~/config/links";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import LfxButton from "~/components/uikit/button/button.vue";
import {
  lfxSecurityCategories, 
  type SecurityCategoryConfig
} from "~/components/modules/project/config/security-category";
import type { SecurityScore } from '~~/types/overview/responses.types';

const route = useRoute();
const {name} = route.params

defineProps<{
  data: SecurityScore[];
}>();

const categoryConfig = (category: string) => (
  category && lfxSecurityCategories[category as SecurityDataCategory]
) as SecurityCategoryConfig

const categoryChartConfig = (result: number) => getGaugeChartConfig({
  value: result,
  gaugeType: 'full',
  name: '',
  lineColor: lfxColors.brand[500],
})
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityScore',
}
</script>
