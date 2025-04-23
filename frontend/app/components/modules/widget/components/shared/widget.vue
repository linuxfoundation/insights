<template>
  <lfx-card class="p-4 sm:p-6">
    <!--    <lfx-widget-menu-->
    <!--      title="Contributors leaderboard"-->
    <!--      class="absolute -top-3 right-6"-->
    <!--      :name="props.name"-->
    <!--    />-->
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">{{ config.name }}</h3>
    <p
      v-if="project"
      class="text-body-2 text-neutral-500 mb-5"
    >
      {{config.description(project)}}
      <a
        v-if="config.learnMoreLink"
        :href="config.learnMoreLink"
        class="text-brand-500"
        target="_blank"
      >Learn more</a>
    </p>
    <hr>
    <component :is="config.component" />
  </lfx-card>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import LfxCard from "~/components/uikit/card/card.vue";
// import LfxWidgetMenu from "~/components/modules/widget/components/shared/widget-menu.vue";
import type {Widget} from "~/components/modules/widget/types/widget";
import {lfxWidgets, type WidgetConfig} from "~/components/modules/widget/config/widget.config";
import {useProjectStore} from "~/components/modules/project/store/project.store";

const props = defineProps<{
  name: Widget
}>();

const { project } = useProjectStore();

const config = computed<WidgetConfig>(() => lfxWidgets[props.name]);
</script>

<script lang="ts">
export default {
  name: 'LfxWidget'
}
</script>
