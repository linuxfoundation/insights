<template>
  <div
    v-if="hasPreviousRoute"
    v-bind="$attrs"
    @click="goBack()"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import {useRouter} from "nuxt/app";
import {computed} from "vue";

const router = useRouter();

const hasPreviousRoute = computed(() => router.options.history.state.back);
const goBack = () => {
  router.back();
};
</script>

<script lang="ts">
export default {
  name: 'LfxBack'
};
</script>
