<template>
  <pv-accordion-panel class="p-accordion-panel">
    <pv-accordion-header class="p-accordion-header">
      <slot name="header" />
    </pv-accordion-header>
    <pv-accordion-content class="p-accordion-content">
      <slot name="content" />
    </pv-accordion-content>
  </pv-accordion-panel>
</template>

<script lang="ts">
export default {
  name: 'LfxAccordionPanel'
};
</script>
