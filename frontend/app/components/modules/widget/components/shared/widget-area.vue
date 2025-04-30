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

      <div class="w-3/4 pb-6 md:pb-10">
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
              <lfx-benchmarks-wrap :benchmark="getBenchmarks(widget)">
                <lfx-widget
                  :name="widget"
                  @update:benchmark-value="onBenchmarkUpdate"
                />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
          </template>
        </lfx-scroll-area>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref} from "vue";
import {storeToRefs} from "pinia";
import type {Widget} from "~/components/modules/widget/types/widget";
import {lfxWidgets} from "~/components/modules/widget/config/widget.config";
import type {WidgetArea} from "~/components/modules/widget/types/widget-area";
import {lfxWidgetArea, type WidgetAreaConfig} from "~/components/modules/widget/config/widget-area.config";
import LfxSideNav from "~/components/uikit/side-nav/side-nav.vue";
import LfxScrollView from "~/components/uikit/scroll-view/scroll-view.vue";
import LfxBenchmarksWrap from "~/components/uikit/benchmarks/benchmarks-wrap.vue";
import LfxScrollArea from "~/components/uikit/scroll-view/scroll-area.vue";
import useScroll from "~/components/shared/utils/scroll";
import LfxWidget from "~/components/modules/widget/components/shared/widget.vue";
import type { Benchmark } from '~~/types/shared/benchmark.types';
import {useProjectStore} from "~/components/modules/project/store/project.store";

const props = defineProps<{
  name: WidgetArea
}>();

const config = computed<WidgetAreaConfig>(() => lfxWidgetArea[props.name]);
const benchmarks = ref<Record<string, Benchmark | undefined>>({});

const activeItem = ref(config.value.widgets?.[0] || '');
const tmpClickedItem = ref('');

const { scrollToTarget, scrollToTop } = useScroll();
const { project } = storeToRefs(useProjectStore())

const widgets = computed(() => (config.value.widgets || [])
    .filter((widget) => {
      console.log(project.value?.widgets)
      const key = lfxWidgets[widget as Widget]?.key;
      return project.value?.widgets.includes(key)
    }));

const sideNavItems = computed(() => widgets.value.map((widget: Widget) => ({
  key: widget,
  label: lfxWidgets[widget]?.name,
})))

const getBenchmarks = (widgetName: string): Benchmark | undefined => benchmarks.value[widgetName];

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

const onBenchmarkUpdate = (value: Benchmark | undefined) => {
  if (value) {
    benchmarks.value[value.key] = value;
  }
}

</script>

<script lang="ts">
export default {
  name: 'LfxWidgetArea'
}
</script>
