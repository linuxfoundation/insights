<template>
  <div class="flex flex-col gap-6">
    <lfx-project-about-software-value />
    <lfx-tags-and-languages />
    <lfx-links />
    <lfx-associated-organization />
  </div>
</template>

<script setup lang="ts">
import LfxProjectAboutSoftwareValue from './about-section/about-software-value.vue';
import LfxTagsAndLanguages from './about-section/tags-ang-languages.vue';
import LfxLinks from './about-section/links.vue';
import LfxAssociatedOrganization from './about-section/associated-organization.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSection'
};
</script>
