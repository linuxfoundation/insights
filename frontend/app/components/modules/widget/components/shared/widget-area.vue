<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container !px-5 lg:!px-10">
    <div class="flex justify-between pt-5 md:pt-10">
      <div class="w-1/4 pr-5 min-w-50 xl:pr-10 max-md:hidden block">
        <lfx-side-nav
          :list="sideNavItems"
          :model-value="activeItem"
          @update:model-value="onSideNavUpdate"
        />
      </div>

      <div class="w-full md:w-3/4 pb-6 md:pb-10">
        <lfx-scroll-area
          class="flex flex-col gap-5 md:gap-8"
          @scrolled-to-view="onScrolledToView"
        >
          <template #default="{ observer }">
            <lfx-scroll-view
              v-for="widget of widgets"
              :id="widget"
              :key="widget"
              :observer="observer"
            >
              <lfx-widget
                :name="widget"
                :benchmark-scores="data"
                @data-loaded="onDataLoaded"
              />
            </lfx-scroll-view>
          </template>
        </lfx-scroll-area>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
computed, ref, onServerPrefetch, watch
} from "vue";
import {storeToRefs} from "pinia";
import {useRoute} from "nuxt/app";
import { BENCHMARKS_API_SERVICE } from '../../services/benchmarks.api.service';
import type {Widget} from "~/components/modules/widget/types/widget";
import {lfxWidgets} from "~/components/modules/widget/config/widget.config";
import type {WidgetArea} from "~/components/modules/widget/types/widget-area";
import {lfxWidgetArea, type WidgetAreaConfig} from "~/components/modules/widget/config/widget-area.config";
import LfxSideNav from "~/components/uikit/side-nav/side-nav.vue";
import LfxScrollView from "~/components/uikit/scroll-view/scroll-view.vue";
import LfxScrollArea from "~/components/uikit/scroll-view/scroll-area.vue";
import useScroll from "~/components/shared/utils/scroll";
import LfxWidget from "~/components/modules/widget/components/shared/widget.vue";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import { useQueryParam } from "~/components/shared/utils/query-param";
import {
  processProjectParams,
  projectParamsSetter
} from "~/components/modules/project/services/project.query.service";
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';

const props = defineProps<{
  name: WidgetArea
}>();

const { showToast } = useToastService();

const route = useRoute();
const config = computed<WidgetAreaConfig>(() => lfxWidgetArea[props.name]);

const { queryParams } = useQueryParam(processProjectParams, projectParamsSetter);
const activeItem = ref(queryParams.value.widget || config.value.widgets?.[0] || '');
const tmpClickedItem = ref('');
const loadedWidgets = ref<Record<string, boolean>>({});

const { scrollToTarget, scrollToTop } = useScroll();
const { project, selectedRepoSlugs, startDate, endDate, selectedReposValues } = storeToRefs(useProjectStore())
const isFirstLoad = ref(true);

const params = computed(() => ({
  projectSlug: route.params.slug as string,
  repos: selectedReposValues.value,
  startDate: startDate.value,
  endDate: endDate.value,
}))

const {
  data, 
  error,
  suspense
} = BENCHMARKS_API_SERVICE.fetchWidgetBenchmarks(params);

const widgets = computed(() => (config.value.widgets || [])
    .filter((widget) => {
      const key = lfxWidgets[widget as Widget]?.key;
      const widgetConfig = lfxWidgets[widget as Widget];
      return (
        project.value?.widgets.includes(key)
        && (!widgetConfig?.hideOnRepoFilter || !selectedRepoSlugs.value.length)
      );
    }));

const sideNavItems = computed(() => widgets.value.map((widget: Widget) => ({
  key: widget,
  label: lfxWidgets[widget]?.name,
})))

const onSideNavUpdate = (value: string) => {
  tmpClickedItem.value = value;
  if (value === sideNavItems.value?.[0]?.key) {
    scrollToTop();
  } else {
    const element = document.getElementById(value);
    if (element) {
      scrollToTarget(element);
    }
  }

  activeItem.value = value;

  // wait for the scroll to complete
  setTimeout(() => {
    tmpClickedItem.value = '';
  }, 1000);
};

const onScrolledToView = (value: string) => {
  if (tmpClickedItem.value === '') {
    activeItem.value = value;
  }
};

/**
 * These functions are used to navigate to the widget in the url params.
 * It checks if the widgets above the current widget are loaded and if so, it navigates to the current widget.
 * The reason for waiting is because widgets have different heights while loading.
 * This causes the scroll to jump to the wrong position.
 * This is a workaround to ensure the scroll is at the correct position.
 */
const onDataLoaded = (value: string) => {
  loadedWidgets.value[value] = true;

  navigateToWidget();
}

const areWidgetsAboveLoaded = (currentWidget: string) => {
  const currentWidgetIndex = widgets.value.indexOf(currentWidget as Widget);
  const widgetsAbove = widgets.value.slice(0, currentWidgetIndex);

  return widgetsAbove.every((widget) => loadedWidgets.value[widget]);
};

const navigateToWidget = () => {
  const widget = route.query?.widget || config.value.widgets?.[0] || '';

  if (widget && areWidgetsAboveLoaded(widget as string) && isFirstLoad.value) {
    setTimeout(() => {
      isFirstLoad.value = false;
      onSideNavUpdate(widget as string);
    }, 100);
  }
}

onServerPrefetch(async () => {
  await suspense();
})

watch(error, (err) => {
  if (err) {
    setTimeout(() => {
      showToast(
        `Error fetching benchmarks`,
        ToastTypesEnum.negative,
        undefined,
        10000
      );
    }, 500);
  }
}, { immediate: true });
</script>

<script lang="ts">
export default {
  name: 'LfxWidgetArea'
}
</script>
