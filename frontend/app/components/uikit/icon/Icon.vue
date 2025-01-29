<template>
  <i :class="`fa-${props.name} fa-${props.type}`" :style="sizeStyle" class="c-icon" />
</template>

<script lang="ts" setup>
import {computed} from "vue";

const props = withDefaults(defineProps<{
  name: string,
  type?: "light" | "regular" | "solid" | "duotone" | "brands",
  size?: number,
}>(), {
    type: "light",
    size: 16
});

const sizeStyle = computed(() => ({
    "--lfx-icon-size": `${(props.size / 16)}rem`
}));
</script>

<script lang="ts">
export default {
    name: "LfxIcon"
};
</script>
