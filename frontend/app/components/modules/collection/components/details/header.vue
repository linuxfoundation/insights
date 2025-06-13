<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white">
    <section
      class="container"
      :class="scrollTop > 50 ? 'py-3 md:py-4' : ' py-5 md:py-8'"
    >
      <div
        :class="scrollTop > 50 ? 'h-0 opacity-0' : 'h-10 sm:h-0 p-px sm:p-0 opacity-100'"
        class="transition-all overflow-hidden ease-linear"
      >
        <nuxt-link
          :to="{name: LfxRoutes.COLLECTIONS}"
          class="block sm:hidden"
        >
          <lfx-button
            type="tertiary"
            size="small"
            icon="fa fa-angle-left fa-light"
            label="Collections"
            class="!rounded-full"
          />
        </nuxt-link>
      </div>
      <div
        class="flex  transition-all"
      >
        <div
          :class="
            scrollTop > 50
              ? 'w-9 mr-3 md:mr-4 opacity-100 visible'
              : 'w-0 sm:w-9 opacity-0 sm:opacity-100 invisible sm:visible pr-0 sm:mr-3 md:mr-4'
          "
          class="transition-all ease-linear"
        >
          <lfx-back
            class="ease-linear transition-all"
            :class="scrollTop > 50 ? 'block' : 'hidden sm:block'"
          >
            <lfx-icon-button
              type="transparent"
              icon="angle-left"
              class=""
            />
          </lfx-back>
        </div>

        <div
          class="flex justify-between gap-x-5 md:gap-x-8 flex-grow flex-col lg:flex-row"
          :class="scrollTop > 50 ? 'lg:items-center': ''"
        >
          <div class="flex-grow flex">
            <div
              class="w-full flex flex-col justify-center"
            >
              <lfx-skeleton
                v-if="loading"
                height="2rem"
                width="25rem"
                class="rounded-sm"
              />
              <h1
                v-else-if="props.collection"
                class="font-secondary font-bold transition-all"
                :class="scrollTop > 50 ? 'text-heading-4 md:text-heading-3' : 'text-heading-3 md:text-heading-2'"
              >
                {{ props.collection.name }}
              </h1>
              <div
                :class="scrollTop > 50 ? 'h-0 opacity-0 invisible pt-0' : 'h-auto opacity-100 visible pt-2 md:pt-3'"
                class=" w-full transition-all ease-linear"
              >
                <lfx-skeleton
                  v-if="loading"
                  height="1.25rem"
                  width="100%"
                  class="rounded-sm"
                />
                <p
                  v-else-if="props.collection"
                  class="text-body-2 md:text-body-1 text-neutral-500"
                >
                  {{props.collection.description}}
                </p>
              </div>
            </div>
          </div>
          <div
            v-if="props.collection"
            class="flex lg:justify-end transition-all ease-linear gap-4"
            :class="
              scrollTop > 50
                ? 'h-0 lg:h-auto opacity-0 sm:opacity-100 invisible lg:visible pt-0'
                : 'h-6 pt-5 lg:pt-0 opacity-100 visible'
            "
          >
            <article class="flex items-center gap-2 h-min">
              <div class="h-6 w-6 md:h-7 md:w-7 rounded-full flex items-center justify-center bg-neutral-100">
                <lfx-icon
                  name="laptop-code"
                  :size="14"
                  class="text-neutral-500 md:!text-base !text-sm"
                />
              </div>
              <lfx-skeleton
                v-if="loading"
                height="1.25rem"
                width="5rem"
                class="rounded-sm mt-2"
              />
              <p
                v-else
                class="leading-6 transition-all whitespace-nowrap text-xs md:text-sm"
              >
                {{formatNumberShort(props.collection.projectCount)}}
                {{ pluralize('project', props.collection.projectCount) }}
              </p>
            </article>
            <article class="flex items-center gap-2 h-min">
              <div class="h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center bg-brand-50">
                <lfx-icon
                  name="people-group"
                  :size="14"
                  class="text-brand-600 md:!text-base !text-sm"
                />
              </div>
              <lfx-skeleton
                v-if="loading"
                height="1.25rem"
                width="5rem"
                class="rounded-sm mt-2"
              />
              <p
                v-else
                class="leading-6 transition-all whitespace-nowrap  text-xs md:text-sm"
              >
                {{formatNumber(props.collection.contributorCount || 0)}}
                {{ pluralize('contributors', props.collection.contributorCount) }}
              </p>
            </article>
            <lfx-tooltip
              v-if="props.collection.softwareValue"
              :content="
                `Aggregated software value of $${
                  formatNumberShort(props.collection.softwareValue)
                } according to Constructive Cost Model (COCOMO)`"
            >
              <article

                class="flex items-center gap-2 h-min"
              >
                <div class="h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center bg-positive-50">
                  <lfx-icon
                    name="dollar-circle"
                    :size="14"
                    class="text-positive-600 md:!text-base !text-sm"
                  />
                </div>
                <lfx-skeleton
                  v-if="loading"
                  height="1.25rem"
                  width="5rem"
                  class="rounded-sm"
                />

                <p
                  v-else
                  class="leading-6 transition-all whitespace-nowrap text-xs md:text-sm"
                >
                  ${{ formatNumberShort(props.collection.softwareValue) }}
                </p>
              </article>
            </lfx-tooltip>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import pluralize from "pluralize";
import type {Collection} from "~~/types/collection";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import LfxBack from "~/components/uikit/back/back.vue";
import {formatNumber, formatNumberShort} from "~/components/shared/utils/formatter";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import useScroll from "~/components/shared/utils/scroll";
import LfxSkeleton from "~/components/uikit/skeleton/skeleton.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import LfxButton from "~/components/uikit/button/button.vue";
import LfxTooltip from "~/components/uikit/tooltip/tooltip.vue";

const props = defineProps<{
  collection?: Collection,
  loading?: boolean
}>()

const {scrollTop} = useScroll();
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionHeader'
};
</script>
