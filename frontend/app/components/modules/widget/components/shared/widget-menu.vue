<template>
  <div class="border border-neutral-100 shadow-xs bg-white rounded-full p-1 flex items-center gap-2">
    <lfx-widget-menu-item @click="openReportModal()">
      <lfx-icon
        name="comment-exclamation"
        :size="18"
      />
    </lfx-widget-menu-item>
  </div>
</template>

<script lang="ts" setup>
// import {onMounted} from "vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxWidgetMenuItem from "~/components/modules/widget/components/shared/widget-menu-item.vue";
import {useReportStore} from "~/components/shared/modules/report/store/report.store";
// import type {Widget} from "~/components/modules/widget/types/widget";

// const props = defineProps<{
//   name: Widget;
// }>()

const {openReportModal} = useReportStore()

// onMounted(() => {
//   console.log(props.name)
// })
</script>

<script lang="ts">
export default {
  name: 'LfxWidgetMenu',
};
</script>
