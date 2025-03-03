<template>
  <div>
    <!-- Tabs -->
    <div class="p-3 hidden sm:block">
      <lfx-tabs
        v-model="tab"
        :tabs="tabs"
      />
    </div>

    <div class="flex flex-col gap-1">
      <!-- Projects -->
      <div
        v-if="!tab && props.projects.length"
        class="pt-3 px-3 text-xs font-semibold leading-5 text-neutral-400"
      >
        Projects
      </div>
      <section
        v-if="!tab || tab === 'projects' && props.projects.length > 0"
        class="flex flex-col gap-1"
      >
        <nuxt-link
          v-for="project of props.projects"
          :key="project.slug"
          :to="{name: LfxRoutes.PROJECT, params: {slug: project.slug}}"
          class="px-3 py-2 rounded-md transition-all
        hover:bg-neutral-50 flex items-center gap-2 cursor-pointer text-sm text-neutral-900"
        >
          <lfx-avatar
            :src="project.logo"
            size="xsmall"
            type="organization"
            class="!rounded-sm !outline-1"
          />
          {{project.name}}
        </nuxt-link>
      </section>
      <section
        v-if="tab === 'projects' && props.projects.length === 0"
        class="px-3 py-12 flex flex-col items-center"
      >
        <lfx-icon
          name="laptop-code"
          :size="40"
          class="text-neutral-300"
        />
        <p class="pt-5 text-sm leading-5 text-neutral-500 text-center">
          We couldn’t find any projects with that term
        </p>
      </section>

      <!-- Repositories -->
      <div
        v-if="!tab && props.repositories.length > 0"
        class="pt-3 px-3 text-xs font-semibold leading-5 text-neutral-400"
      >
        Repositories
      </div>
      <section
        v-if="!tab || tab === 'repositories' && props.repositories.length > 0"
        class="flex flex-col gap-1"
      >
        <nuxt-link
          v-for="repository of props.repositories"
          :key="repository.slug"
          :to="{name: LfxRoutes.REPOSITORY, params: {name: repository.slug, slug: repository.projectSlug}}"
          class="px-3 py-2 rounded-md transition-all
        hover:bg-neutral-50 flex items-center gap-2 cursor-pointer text-sm text-neutral-900"
        >
          <lfx-icon
            name="book"
            :size="16"
            class="text-neutral-400"
          />
          {{repository.name}}
        </nuxt-link>
      </section>
      <section
        v-if="tab === 'repositories' && props.repositories.length === 0"
        class="px-3 py-12 flex flex-col items-center"
      >
        <lfx-icon
          name="book"
          :size="40"
          class="text-neutral-300"
        />
        <p class="pt-5 text-sm leading-5 text-neutral-500 text-center">
          We couldn’t find any repositories with that term
        </p>
      </section>

      <!-- Collections -->
      <div
        v-if="!tab && props.collections.length > 0"
        class="pt-3 px-3 text-xs font-semibold leading-5 text-neutral-400"
      >
        Collections
      </div>
      <section
        v-if="!tab || tab === 'collections' && props.collections.length > 0"
        class="flex flex-col gap-1"
      >
        <nuxt-link
          v-for="collection of props.collections"
          :key="collection.slug"
          :to="{name: LfxRoutes.COLLECTION, params: { slug: collection.slug }}"
          class="px-3 py-2 rounded-md transition-all
        hover:bg-neutral-50 flex items-center gap-2 cursor-pointer text-sm text-neutral-900"
        >
          <lfx-icon
            name="rectangle-history"
            :size="16"
            class="text-neutral-400"
          />
          {{collection.name}}
        </nuxt-link>
      </section>
      <section
        v-if="tab === 'collections' && props.collections.length === 0"
        class="px-3 py-12 flex flex-col items-center"
      >
        <lfx-icon
          name="rectangle-history"
          :size="40"
          class="text-neutral-300"
        />
        <p class="pt-5 text-sm leading-5 text-neutral-500 text-center">
          We couldn’t find any collections with that term
        </p>
      </section>

      <!-- No results -->
      <section
        v-if="!tab && props.projects.length === 0 && props.repositories.length === 0 && props.collections.length === 0"
        class="px-3 py-12 flex flex-col items-center"
      >
        <lfx-icon
          name="face-monocle"
          :size="40"
          class="text-neutral-300"
        />
        <p class="pt-5 text-sm leading-5 text-neutral-500 text-center">
          We couldn’t find anything with that term. Please try again.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxTabs from "~/components/uikit/tabs/tabs.vue";
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import type {SearchCollection, SearchProject, SearchRepository} from "~/components/shared/types/search";

const props = defineProps<{
  projects: SearchProject[];
  repositories: SearchRepository[];
  collections: SearchCollection[];
}>()

const tab = ref('');

const tabs = [
  {
    value: '',
    label: 'All',
  },
  {
    value: 'projects',
    label: 'Projects',
  },
  {
    value: 'repositories',
    label: 'Repositories',
  },
  {
    value: 'collections',
    label: 'Collections',
  },
]
</script>

<script lang="ts">
  export default {
    name: 'LfxSearchResult'
  }
</script>
