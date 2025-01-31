<template>
  <div class="py-8 bg-white border-b border-neutral-200 sticky top-header">
    <div class="container">
      <h1 class="text-heading-1 font-semibold pb-4">{{ slug }}</h1>
      <div class="flex items-center gap-3">
        <lfx-menu-button :to="{name: LfxRoutes.PROJECT}" exact>
          <lfx-icon name="gauge-high" />
          Overview
        </lfx-menu-button>
        <lfx-menu-button :to="{name: LfxRoutes.PROJECT_CONTRIBUTORS}">
          <lfx-icon name="people-group" />
          Contributors
        </lfx-menu-button>
        <lfx-menu-button :to="{name: LfxRoutes.PROJECT_POPULARITY}">
          <lfx-icon name="fire" />
          Popularity
        </lfx-menu-button>
        <lfx-menu-button :to="{name: LfxRoutes.PROJECT_DEVELOPMENT}">
          <lfx-icon name="code" />
          Development
        </lfx-menu-button>
        <lfx-menu-button :to="{name: LfxRoutes.PROJECT_SECURITY}">
          <lfx-icon name="shield-check" />
          Security & Best Practices
        </lfx-menu-button>
      </div>
    </div>
  </div>
  <div>
    <nuxt-page />
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import LfxIcon from "~/components/uikit/icon/icon.vue";

const route = useRoute();
const {slug} = route.params;
</script>
