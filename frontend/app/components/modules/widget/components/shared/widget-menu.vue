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
          :class="link.buttonClass"
        />
        <lfx-tooltip
          v-else-if="link.enabled"
          :content="link.label"
          placement="top"
          :disabled="link.showLabel"
        >
          <lfx-widget-menu-popover
            v-if="link.popOverComponent"
            :link="link"
            :widget-name="props.name"
            @update:is-popover-menu-clicked="isMenuOpen = $event"
          />

          <lfx-widget-menu-item
            v-else
            class="flex gap-2 items-center"
            :class="`${link.showLabel ? '!w-auto !px-3' : ''} ${link.buttonClass}`"
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
            v-if="link.isSeparator && link.enabled && !link.hideOnMobile"
          />
          <lfx-dropdown-item
            v-else-if="link.enabled && !link.hideOnMobile"
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
import {computed, ref, type Component} from "vue";
import {storeToRefs} from "pinia";
import LfxWidgetMenuPopover from "./widget-menu-popover.vue";
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
import { useAuthStore } from "~/components/modules/auth/store/auth.store";
import LfxCopilotWidgetModal from "~/components/shared/modules/copilot/components/copilot-widget-modal.vue";
import { hasLfxInsightsPermission } from "~/components/shared/utils/jwt-permissions";

export interface MenuItem {
  label: string;
  icon: string;
  action: () => void;
  enabled: boolean;
  showLabel?: boolean;
  iconClass?: string;
  buttonClass?: string;
  isSeparator: boolean;
  hideOnMobile?: boolean;
  popOverComponent?: Component;
}

const emit = defineEmits<{
  (e: 'update:isMenuOpen', value: boolean): void
}>();
const props = defineProps<{
  name: Widget;
  data: object
  isMenuOpen: boolean
}>()

const isMenuOpen = computed({
  get: () => props.isMenuOpen,
  set: (value) => emit('update:isMenuOpen', value)
});

const config = computed(() => lfxWidgets[props.name]);

const isSnapshotModalOpen = ref(false)
const isEmbedModalOpen = ref(false)

const {openReportModal} = useReportStore()
const {openShareModal} = useShareStore()

const {
  project, 
  selectedRepositories} = storeToRefs(useProjectStore());
const {token} = storeToRefs(useAuthStore())
const isCopilotEnabled = computed(() => !!config.value.copilot && hasLfxInsightsPermission(token.value))

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

const menu = computed<MenuItem[]>(() => [
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
    enabled: config.value.embed || config.value.snapshot || config.value.share || isCopilotEnabled.value,
    buttonClass: '!hidden xl:!block',
    isSeparator: true,
    hideOnMobile: true
  },
  {
    label: 'Ask Copilot',
    icon: 'sparkles',
    iconClass: '!text-brand-500',
    buttonClass: `py-1.5 !hidden xl:!flex rounded-full ${isMenuOpen.value ? 'bg-neutral-50' : ''}`,
    action: () => {},
    enabled: isCopilotEnabled.value,
    showLabel: true,
    isSeparator: false,
    hideOnMobile: true,
    popOverComponent: LfxCopilotWidgetModal
  }
])
</script>

<script lang="ts">
export default {
  name: 'LfxWidgetMenu',
};
</script>
