<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="lg:flex hidden items-center gap-3">
    <template v-if="isProjectLoading">
      <lfx-skeleton-state
        v-for="link of lfProjectLinks"
        :key="link.label"
        :status="'pending'"
        height="2rem"
        width="7.5rem"
        rounded-class="rounded-full"
      />
    </template>
    <lfx-tooltip
      v-for="link of links"
      v-else
      :key="link.label"
      content="Coming soon"
      placement="top"
      :disabled="!link.comingSoon"
    >
      <lfx-menu-button
        :to="linkUrl(link)"
        :exact="true"
        :disabled="link.comingSoon"
      >
        <lfx-icon :name="link.icon" />
        {{ link.label }}
      </lfx-menu-button>
    </lfx-tooltip>
  </div>
  <div class="lg:hidden block">
    <lfx-dropdown
      placement="bottom-start"
      width="15rem"
    >
      <template #trigger>
        <lfx-dropdown-selector>
          <lfx-icon
            :name="activeLink?.icon || ''"
            :size="16"
            class="text-brand-500 font-black"
          />
          {{activeLink?.label}}
        </lfx-dropdown-selector>
      </template>

      <template
        v-for="link of links"
        :key="link.label"
      >
        <router-link
          v-if="!link.comingSoon"
          :to="linkUrl(link)"
        >
          <lfx-dropdown-item
            :value="linkUrl(link)"
            :label="link.label"
          />
        </router-link>

      </template>

    </lfx-dropdown>

  </div>
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {computed} from "vue";
import { storeToRefs } from 'pinia';
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxTooltip from "~/components/uikit/tooltip/tooltip.vue";
import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
import LfxDropdown from "~/components/uikit/dropdown/dropdown.vue";
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import {lfProjectLinks} from "~/components/modules/project/config/links";
import type {Project} from "~~/types/project";
import {WidgetArea} from "~/components/modules/widget/types/widget-area";
import {lfxWidgetArea} from "~/components/modules/widget/config/widget-area.config";
import {lfxWidgets} from "~/components/modules/widget/config/widget.config";
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";

const props = defineProps<{
  project?: Project
}>();

const route = useRoute();
const repoName = computed(() => route.params.name as string);

const { isProjectLoading, selectedRepositoryGroup } = storeToRefs(useProjectStore());

const activeLink = computed(() => lfProjectLinks.find((link) => (repoName.value
      ? link.repoRouteName === route.name
      : link.projectRouteName === route.name)));

const isAreaEnabled = (area: WidgetArea) => {
  const widgets = lfxWidgetArea[area].widgets || [];

  if (area === WidgetArea.SECURITY) {
    return props.project?.connectedPlatforms.some((platform) => platform.toLowerCase().includes('github'));
  }

  return widgets.length === 0 || widgets.some((widget) => props.project?.widgets.includes(lfxWidgets[widget]?.key))
}

const links = computed(() => lfProjectLinks.filter((link) => isAreaEnabled(link.area)))

const linkUrl = (link: typeof lfProjectLinks[number]) => {
  if (link.comingSoon) {
    return undefined;
  }

  const query = {
    ...route.query,
    widget: undefined // remove the widget from the query
  }
  let name = link.projectRouteName;
  if (selectedRepositoryGroup.value) {
    name = link.repoGroupRouteName;
  }
  else if(repoName.value) {
    name = link.repoRouteName;
  }

  return {
    name,
    query
  };
}
</script>

<script lang="ts">
export default {
  name: 'LfxProjectMenu'
};
</script>
