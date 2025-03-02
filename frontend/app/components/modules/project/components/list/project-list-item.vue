<template>
  <nuxt-link
    :to="{name: LfxRoutes.PROJECT, params: {slug: props.project.slug}}"
    class="flex flex-col"
  >
    <lfx-card class="p-6 flex flex-col transition-all hover:shadow-sm h-full">
      <lfx-avatar
        :src="props.project.logo || ''"
        size="large"
        type="organization"
      />
      <h3 class="text-heading-3 font-bold font-secondary pt-4 line-clamp-1">
        {{ props.project.name }}
      </h3>
      <p class="pt-3 text-body-1 text-neutral-500 line-clamp-2">
        {{ props.project.description }}
      </p>
      <div class="flex-grow" />
      <div class="pt-5 flex flex-col gap-2">
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
            {{formatNumber(props.project.contributorsCount)}}
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
            {{formatNumber(props.project.organizationsCount)}}
          </p>
        </article>
        <article class="flex justify-between items-center">
          <lfx-tag
            type="transparent"
            size="medium"
          >
            <lfx-icon
              name="dollar-circle"
              :size="14"
            />
            Software value
          </lfx-tag>
          <p class="text-body-1">
            ${{formatNumberShort(props.project.softwareValueCount)}}
          </p>
        </article>
      </div>
    </lfx-card>
  </nuxt-link>
</template>

<script lang="ts" setup>
import {formatNumber, formatNumberShort} from "../../../../shared/utils/formatter";
import LfxCard from "~/components/uikit/card/card.vue";
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import LfxTag from "~/components/uikit/tag/tag.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import type {Project} from "~/components/modules/project/types/project";
import {LfxRoutes} from "~/components/shared/types/routes";

const props = defineProps<{
  project: Project
}>()
</script>

<script lang="ts">
export default {
  name: 'LfxProjectListItem'
}
</script>
