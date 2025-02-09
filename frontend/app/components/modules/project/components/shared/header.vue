<template>
  <div class="bg-white border-b border-neutral-200 sticky top-14 lg:top-17">
    <section class="container">
      <div class="flex items-center justify-between py-6">
        <div class="flex items-center">
          <lfx-avatar type="organization" size="large" class="mr-4" src="https://c8.alamy.com/comp/2M8NCEE/kubernetes-logo-white-background-2M8NCEE.jpg" />
          <router-link :to="{name: LfxRoutes.PROJECT}">
            <h1 class=" font-semibold mr-2">{{ slug }}</h1>
          </router-link>
          <span class="mr-2 text-neutral-400">/</span>
          <div class="flex items-center gap-2 cursor-pointer">
            <p v-if="repoName" class="font-secondary text-neutral-400">{{ repoName }}</p>

            <router-link v-else :to="{name: LfxRoutes.REPOSITORY, params: {name: 'samplerepo'}}">
              <p  class="font-secondary text-neutral-400">All repositories</p>
            </router-link>
            <lfx-icon name="angles-up-down" :size="12" class="text-neutral-400" />
          </div>
        </div>
        <lfx-button type="tertiary" class="!rounded-full">
          <lfx-icon name="share-nodes" />
          Share
        </lfx-button>
      </div>
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center gap-3">
          <lfx-menu-button :to="{name: repoName ? LfxRoutes.REPOSITORY : LfxRoutes.PROJECT }" exact>
            <lfx-icon name="gauge-high" />
            Overview
          </lfx-menu-button>
          <lfx-menu-button :to="{name: repoName ? LfxRoutes.REPOSITORY_CONTRIBUTORS : LfxRoutes.PROJECT_CONTRIBUTORS}">
            <lfx-icon name="people-group" />
            Contributors
          </lfx-menu-button>
          <lfx-menu-button :to="{name: repoName ? LfxRoutes.REPOSITORY_POPULARITY : LfxRoutes.PROJECT_POPULARITY}">
            <lfx-icon name="fire" />
            Popularity
          </lfx-menu-button>
          <lfx-menu-button :to="{name: repoName ? LfxRoutes.REPOSITORY_DEVELOPMENT : LfxRoutes.PROJECT_DEVELOPMENT}">
            <lfx-icon name="code" />
            Development
          </lfx-menu-button>
          <lfx-menu-button :to="{name: repoName ? LfxRoutes.REPOSITORY_SECURITY : LfxRoutes.PROJECT_SECURITY}">
            <lfx-icon name="shield-check" />
            Security & Best Practices
          </lfx-menu-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import {useRoute} from "nuxt/app";
import {computed} from "vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import LfxButton from "~/components/uikit/button/button.vue";

const route = useRoute();

const slug = computed(() => route.params.slug);
const repoName = computed(() => route.params.name);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectHeader'
}
</script>
