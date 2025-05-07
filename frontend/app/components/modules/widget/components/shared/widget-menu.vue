<template>
  <div>
    <div class="border border-neutral-100 shadow-xs bg-white rounded-full p-1 hidden md:flex items-center gap-2">
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
        >
          <lfx-widget-menu-item
            @click="link.action()"
          >
            <lfx-icon
              :name="link.icon"
              :size="18"
            />
          </lfx-widget-menu-item>
        </lfx-tooltip>
      </template>

    </div>

    <div class="block md:hidden">
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
            <lfx-icon :name="link.icon" /> {{link.label}}
          </lfx-dropdown-item>
        </template>
      </lfx-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from "vue";
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

const props = defineProps<{
  name: Widget;
}>()

const {openReportModal} = useReportStore()
const {openShareModal} = useShareStore()

const config = computed(() => lfxWidgets[props.name]);

const {project, repository} = storeToRefs(useProjectStore());

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
  const repoTitle = repository.value?.name ? ` - ${repository.value?.name.split('/').at(-1)}` : '';
  const title = `${project.value?.name}${repoTitle} - ${config.value.name} | LFX Insights`
  openShareModal({
    url: url.toString(),
    area: config.value.name,
    title,
  });
}

const menu: {
  label: string;
  icon: string;
  action: () => void;
  enabled: boolean;
  isSeparator: boolean
}[] = [
  {
    label: 'Report issue',
    icon: 'comment-exclamation',
    action: report,
    enabled: true,
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
    },
    enabled: config.value.embed,
    isSeparator: false
  },
  {
    label: 'Snapshot',
    icon: 'screenshot',
    action: () => {
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
  }
]
</script>

<script lang="ts">
export default {
  name: 'LfxWidgetMenu',
};
</script>
