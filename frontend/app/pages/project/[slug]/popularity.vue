<template>
  <lfx-widget-area :name="WidgetArea.POPULARITY" />
</template>

<script setup lang="ts">
import {useProjectStore} from "~/components/modules/project/store/project.store";
import {WidgetArea} from "~/components/modules/widget/types/widget-area";
import LfxWidgetArea from "~/components/modules/widget/components/shared/widget-area.vue";

const {project} = useProjectStore();

const title = `${project?.name || 'Project'} popularity insights | LFX Insights`;
const description = `Explore ${project?.name ? `${project.name} ` : ''}popularity insights.`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
