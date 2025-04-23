<template>
  <lfx-widget-area :name="WidgetArea.CONTRIBUTORS" />
</template>

<script setup lang="ts">
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxWidgetArea from "~/components/modules/widget/components/shared/widget-area.vue";
import {WidgetArea} from "~/components/modules/widget/types/widget-area";

const {project} = useProjectStore();

const title = `${project?.name || 'Project'} contributors insights | LFX Insights`;
const description = `Explore ${project?.name ? `${project.name} ` : ''}contributors insights,
highlighting their efforts and impact on the project.`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
