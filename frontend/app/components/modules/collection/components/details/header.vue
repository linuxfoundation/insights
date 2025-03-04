<template>
  <div class="bg-white">
    <section class="container">
      <div
        class="flex gap-4 transition-all"
        :class="scrollTop > 50 ? 'py-3 md:py-4' : ' py-5 md:py-8'"
      >
        <lfx-back class="ease-linear transition-all hidden md:block">
          <lfx-icon-button
            type="transparent"
            icon="angle-left"
            class=""
          />
        </lfx-back>
        <div
          class="flex justify-between gap-x-5 md:gap-x-8 flex-grow flex-col sm:flex-row"
          :class="scrollTop > 50 ? 'gap-y-3': 'gap-y-5'"
        >
          <div class="flex-grow flex">
            <div
              :class="scrollTop > 50 ? 'pt-1' : 'pt-0.5'"
              class="w-full"
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
                :class="scrollTop > 50 ? 'text-heading-3' : 'text-heading-3 md:text-heading-2'"
              >
                {{ props.collection.name }}
              </h1>
              <div
                v-if="scrollTop <= 50"
                class="pt-2 md:pt-3 w-full"
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
            class="flex flex-wrap sm:justify-end transition-all gap-5 md:gap-6"
          >
            <article class="flex items-start gap-2">
              <div class="h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center bg-brand-50">
                <lfx-icon
                  name="laptop-code"
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
                class="leading-6 transition-all"
                :class="scrollTop > 50 ? 'text-xs md:text-sm' : 'text-xs md:text-base'"
              >
                {{formatNumberShort(props.collection.projectsCount)}} projects
              </p>
            </article>
            <article class="flex items-start gap-2">
              <div class="h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center bg-positive-50">
                <lfx-icon
                  name="dollar-circle"
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
                class="leading-6 transition-all"
                :class="scrollTop > 50 ? 'text-xs md:text-sm' : 'text-xs md:text-base'"
              >
                <span class="text-neutral-500">Software value:</span>
                ${{ formatNumberShort(props.collection.softwareValueCount) }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import LfxBack from "~/components/uikit/back/back.vue";
import type {Collection} from "~/components/modules/collection/types/Collection";
import {formatNumberShort} from "~/components/shared/utils/formatter";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import useScroll from "~/components/shared/utils/scroll";
import LfxSkeleton from "~/components/uikit/skeleton/skeleton.vue";

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
