<template>
  <nuxt-link
    v-if="props.to"
    v-bind="$attrs"
    :to="props.to"
    class="c-menu-button"
    :active-class="!props.exact ? 'is-active' : undefined"
    :exact-active-class="props.exact ? 'is-active' : undefined"
    :class="{ 'is-active': props.active }"
  >
    <slot />
  </nuxt-link>
  <div
    v-else
    v-bind="$attrs"
    class="c-menu-button"
    :class="{ 'is-active': props.active }"
  >
    <slot />
  </div>

</template>

<script lang="ts" setup>
  import type { RouteLocationRaw } from 'vue-router';

  const props = withDefaults(defineProps<{
    active?: boolean;
    to?: RouteLocationRaw;
    exact?: boolean;
  }>(), {
    active: false,
    to: undefined,
    exact: false,
  })
</script>

<script lang="ts">
export default {
    name: "LfxMenuButton"
};
</script>
