<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <div class="border border-neutral-100 shadow-xs bg-white rounded-full p-1 hidden lg:flex items-center gap-2">
      <template
        v-for="link of menu"
        :key="link.label"
      >
        <div
          v-if="link.isSeparator && link.enabled"
          class="h-6 border-r border-r-neutral-200"
        />
        <lfx-tooltip
          v-else-if="link.enabled"
          :content="link.label"
          placement="top"
          :disabled="link.showLabel"
        >
          <lfx-widget-menu-item
            class="flex gap-2 items-center"
            :class="link.showLabel ? '!w-auto !px-4' : ''"
            @click="link.action()"
          >
            <lfx-icon
              :name="link.icon"
              :size="18"
              :class="link.iconClass"
            />
            <span
              v-if="link.showLabel"
              class="text-sm font-medium"
            >{{link.label}}</span>
          </lfx-widget-menu-item>
        </lfx-tooltip>
      </template>

    </div>

    <div class="block lg:hidden">
      <lfx-dropdown
        width="15rem"
        placement="bottom-end"
      >
        <template #trigger>
          <lfx-icon-button
            icon="ellipsis"
            size="small"
            type="transparent"
            class="!p-2"
          />
        </template>
        <template
          v-for="link of menu.reverse()"
          :key="link.label"
        >
          <lfx-dropdown-separator
            v-if="link.isSeparator && link.enabled"
          />
          <lfx-dropdown-item
            v-else-if="link.enabled"
            @click="link.action()"
          >
            <lfx-icon
              :name="link.icon"
              :class="link.iconClass"
            /> {{link.label}}
          </lfx-dropdown-item>
        </template>
      </lfx-dropdown>
    </div>

    <lfx-snapshot-modal
      v-if="isSnapshotModalOpen"
      v-model="isSnapshotModalOpen"
      :widget-name="props.name"
      :data="props.data"
    />

    <lfx-widget-embed-modal
      v-if="isEmbedModalOpen"
      v-model="isEmbedModalOpen"
      :widget-name="props.name"
      :data="props.data"
    />
  </div>
</template>

<script lang="ts" setup>
import {computed, ref} from "vue";
import {storeToRefs} from "pinia";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxWidgetMenuItem from "~/components/modules/widget/components/shared/widget-menu-item.vue";
import {useReportStore} from "~/components/shared/modules/report/store/report.store";
import type {Widget} from "~/components/modules/widget/types/widget";
import {lfxWidgetArea} from "~/components/modules/widget/config/widget-area.config";
import type {WidgetArea} from "~/components/modules/widget/types/widget-area";
import LfxTooltip from "~/components/uikit/tooltip/tooltip.vue";
import {lfxWidgets} from "~/components/modules/widget/config/widget.config";
import {useShareStore} from "~/components/shared/modules/share/store/share.store";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxDropdown from "~/components/uikit/dropdown/dropdown.vue";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import LfxDropdownSeparator from "~/components/uikit/dropdown/dropdown-separator.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxSnapshotModal from "~/components/modules/widget/components/shared/snapshot/snapshot-modal.vue";
import LfxWidgetEmbedModal from "~/components/modules/widget/components/shared/embed/embed-modal.vue";
import {useCopilotStore} from "~/components/shared/modules/copilot/store/copilot.store";

const props = defineProps<{
  name: Widget;
  data: object
}>()

const config = computed(() => lfxWidgets[props.name]);

const isSnapshotModalOpen = ref(false)
const isEmbedModalOpen = ref(false)

const {openReportModal} = useReportStore()
const {openShareModal} = useShareStore()
const {openCopilotWidgetModal} = useCopilotStore()

const {project, selectedRepositories} = storeToRefs(useProjectStore());

const widgetArea = computed(
    () => Object.keys(lfxWidgetArea).find(
        (area) => (lfxWidgetArea[area as WidgetArea].widgets || []).includes(props.name)
    ) as WidgetArea
)

const report = () => {
  openReportModal({
    area: widgetArea.value,
    widget: props.name,
  })
}

const share = () => {
  const url = new URL(window.location.href);
  url.searchParams.set('widget', props.name);
  const repoTitle = selectedRepositories.value.length > 0 ?
    ` - ${selectedRepositories.value.map((repo) => repo.name).join(', ')}` : '';
  const title = `${project.value?.name}${repoTitle} - ${config.value.name} | LFX Insights`
  openShareModal({
    url: url.toString(),
    area: config.value.name,
    title,
    additionalShare: config.value.additionalShare
  });
}

const askCopilot = () => {
  openCopilotWidgetModal({
    widget: props.name,
    icon: 'users',
    suggestions: ''
  });
}

const menu: {
  label: string;
  icon: string;
  action: () => void;
  enabled: boolean;
  showLabel?: boolean;
  iconClass?: string;
  isSeparator: boolean
}[] = [
  {
    label: 'Report issue',
    icon: 'comment-exclamation',
    iconClass: '!text-warning-600',
    action: report,
    enabled: true,
    showLabel: true,
    isSeparator: false
  },
  {
    label: '',
    icon: '',
    action: () => {
    },
    enabled: config.value.embed || config.value.snapshot || config.value.share,
    isSeparator: true
  },
  {
    label: 'Embed',
    icon: 'code',
    action: () => {
      isEmbedModalOpen.value = true;
    },
    enabled: config.value.embed,
    isSeparator: false
  },
  {
    label: 'Snapshot',
    icon: 'screenshot',
    action: () => {
      isSnapshotModalOpen.value = true;
    },
    enabled: config.value.snapshot,
    isSeparator: false
  },
  {
    label: 'Share',
    icon: 'share-nodes',
    action: share,
    enabled: config.value.share,
    isSeparator: false
  },
  {
    label: '',
    icon: '',
    action: () => {
    },
    enabled: config.value.embed || config.value.snapshot || config.value.share,
    isSeparator: true
  },
  {
    label: 'Ask Copilot',
    icon: 'sparkles',
    iconClass: '!text-brand-500',
    action: askCopilot,
    enabled: !!config.value.copilot,
    showLabel: true,
    isSeparator: false
  }
]
</script>

<script lang="ts">
export default {
  name: 'LfxWidgetMenu',
};
</script>
