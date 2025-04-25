<template>
  <div class="border border-neutral-100 shadow-xs bg-white rounded-full p-1 flex items-center gap-2">
    <lfx-tooltip content="Report issue">
      <lfx-widget-menu-item
        @click="openReportModal({
          area: widgetArea,
          widget: props.name,
        })"
      >
        <lfx-icon
          name="comment-exclamation"
          :size="18"
        />
      </lfx-widget-menu-item>
    </lfx-tooltip>
  </div>
</template>

<script lang="ts" setup>
// import {onMounted} from "vue";
import {computed} from "vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxWidgetMenuItem from "~/components/modules/widget/components/shared/widget-menu-item.vue";
import {useReportStore} from "~/components/shared/modules/report/store/report.store";
import type {Widget} from "~/components/modules/widget/types/widget";
import {lfxWidgetArea} from "~/components/modules/widget/config/widget-area.config";
import type {WidgetArea} from "~/components/modules/widget/types/widget-area";
import LfxTooltip from "~/components/uikit/tooltip/tooltip.vue";

const props = defineProps<{
  name: Widget;
}>()

const {openReportModal} = useReportStore()

const widgetArea = computed(
    () => Object.keys(lfxWidgetArea).find(
        (area) => (lfxWidgetArea[area as WidgetArea].widgets || []).includes(props.name)
    ) as WidgetArea
)
</script>

<script lang="ts">
export default {
  name: 'LfxWidgetMenu',
};
</script>
