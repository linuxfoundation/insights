<template>
  <div class="bg-white">
    <section class="container">
      <div
        class="flex gap-4 transition-all"
        :class="scrollTop > 50 ? 'py-4' : 'py-8'"
      >
        <lfx-back class="ease-linear transition-all">
          <lfx-icon-button
            type="transparent"
            icon="angle-left"
            class=""
          />
        </lfx-back>
        <div class="flex justify-between gap-8 flex-wrap flex-grow">
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
                :class="scrollTop > 50 ? 'text-heading-3' : 'text-heading-2'"
              >
                {{ props.collection.name }}
              </h1>
              <div
                v-if="scrollTop <= 50"
                class="pt-3 w-full"
              >
                <lfx-skeleton
                  v-if="loading"
                  height="1.25rem"
                  width="100%"
                  class="rounded-sm"
                />
                <p
                  v-else-if="props.collection"
                  class="text-body-1 pt-3 text-neutral-500"
                >
                  {{props.collection.description}}
                </p>
              </div>
            </div>
          </div>
          <div
            class="flex justify-start transition-all"
            :class="scrollTop > 50 ? 'gap-5 pt-2' : 'gap-8 pt-0'"
          >
            <article>
              <lfx-tag
                type="transparent"
                size="small"
              >
                <lfx-icon
                  name="people-group"
                  :size="12"
                />
                <span
                  v-if="scrollTop > 50 && props.collection"
                  class="text-neutral-900 font-normal"
                >
                  {{ formatNumberShort(props.collection.contributorsCount) }}
                </span>
                <span v-else>Contributors</span>
              </lfx-tag>
              <lfx-skeleton
                v-if="loading"
                height="1.25rem"
                width="5rem"
                class="rounded-sm mt-2"
              />
              <p
                v-else-if="scrollTop <= 50 && props.collection"
                class="text-2xl leading-7 mt-1"
              >
                {{ formatNumberShort(props.collection.contributorsCount) }}
              </p>
            </article>
            <article>
              <lfx-tag
                type="transparent"
                size="small"
              >
                <lfx-icon
                  name="building"
                  :size="12"
                />
                <span
                  v-if="scrollTop > 50 && props.collection"
                  class="text-neutral-900 font-normal"
                >
                  {{ formatNumberShort(props.collection.organizationsCount) }}
                </span>
                <span v-else>Organizations</span>
              </lfx-tag>
              <lfx-skeleton
                v-if="loading"
                height="1.25rem"
                width="5rem"
                class="rounded-sm mt-2"
              />
              <p
                v-else-if="scrollTop <= 50 && props.collection"
                class="text-2xl leading-7 mt-1"
              >
                {{formatNumberShort(props.collection.organizationsCount)}}
              </p>
            </article>
            <article>
              <lfx-tag
                type="transparent"
                size="small"
              >
                <lfx-icon
                  name="laptop-code"
                  :size="12"
                />
                <span
                  v-if="scrollTop > 50 && props.collection"
                  class="text-neutral-900 font-normal"
                >
                  {{ formatNumberShort(props.collection.projectsCount) }}
                </span>
                <span v-else>Projects</span>
              </lfx-tag>
              <lfx-skeleton
                v-if="loading"
                height="1.25rem"
                width="5rem"
                class="rounded-sm mt-2"
              />
              <p
                v-else-if="scrollTop <= 50 && props.collection"
                class="text-2xl leading-7 mt-1"
              >
                {{formatNumberShort(props.collection.projectsCount)}}
              </p>
            </article>
            <article>
              <lfx-tag
                type="transparent"
                size="small"
              >
                <lfx-icon
                  name="dollar-circle"
                  :size="12"
                />
                <span
                  v-if="scrollTop > 50 && props.collection"
                  class="text-neutral-900 font-normal"
                >
                  ${{ formatNumberShort(props.collection.softwareValueCount) }}
                </span>
                <span v-else>Software value</span>
              </lfx-tag>
              <lfx-skeleton
                v-if="loading"
                height="1.25rem"
                width="5rem"
                class="rounded-sm mt-2"
              />
              <p
                v-else-if="scrollTop <= 50 && props.collection"
                class="text-2xl leading-7 mt-1"
              >
                ${{formatNumberShort(props.collection.softwareValueCount)}}
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
import LfxTag from "~/components/uikit/tag/tag.vue";
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
