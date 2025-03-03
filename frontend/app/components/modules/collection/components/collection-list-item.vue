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
        <div class="w-5/12 px-2 flex justify-end">
          <div class="flex flex-wrap gap-8 justify-start">
            <article>
              <lfx-tag
                type="transparent"
                size="small"
              >
                <lfx-icon
                  name="people-group"
                  :size="12"
                />
                Contributors
              </lfx-tag>
              <p class="text-lg leading-7 mt-1">
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
                Organizations
              </lfx-tag>
              <p class="text-lg leading-7 mt-1">
                {{ formatNumberShort(props.collection.organizationsCount) }}
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
                Projects
              </lfx-tag>
              <p class="text-lg leading-7 mt-1">
                {{ formatNumberShort(props.collection.projectsCount) }}
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
                Software value
              </lfx-tag>
              <p class="text-lg leading-7 mt-1">
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
import LfxTag from "~/components/uikit/tag/tag.vue";
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
