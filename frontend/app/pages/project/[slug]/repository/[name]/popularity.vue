<template>
  <lfx-widget-area :name="WidgetArea.POPULARITY" />
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import {WidgetArea} from "~/components/modules/widget/types/widget-area";
import LfxWidgetArea from "~/components/modules/widget/components/shared/widget-area.vue";

const route = useRoute();
const name = route.params.name as string;
const {project} = useProjectStore();

const title = `${name || 'Repository'} popularity insights | ${project?.name} | LFX Insights`;
const description = `Explore ${name || ''} popularity insights${project?.name ? ` under the ${project.name}` : ''}.`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
