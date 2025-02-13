<template>
  <lfx-modal v-model="isModalOpen">
    <div class="p-1">
      <!-- Search input -->
      <label class="flex items-center justify-between px-3 py-2 gap-2">
        <lfx-icon name="search" :size="16" class="text-neutral-400" />
        <input
          ref="searchInputRef"
          v-model="search"
          type="text"
          class="outline-0 flex-grow text-sm text-neutral-900 leading-5"
          placeholder="Search projects, repositories, or collections..."
          @update:model-value="triggerSearch"
        >
        <lfx-icon
          v-if="search.length > 0"
          name="circle-xmark"
          :size="16"
          class="text-neutral-300 font-black cursor-pointer"
          @click="search = ''"
        />
      </label>

      <!-- Result -->
      <div v-if="search.length && searchQuery.length > 0" class="border-t border-neutral-100 pt-1">
        <div v-if="loading" class="flex items-center justify-between h-32 py-1">
          <lfx-spinner :size="40" class=" text-neutral-300" />
        </div>
        <!-- Results -->
        <lfx-search-result
          v-else
          :projects="projects"
          :repositories="repositories"
          :collections="collections"
        />
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import {computed, onMounted} from "vue";
import LfxModal from "~/components/uikit/modal/modal.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxSearchResult from "~/components/shared/layout/search/search-result.vue";
import type {
SearchCollection, SearchProject, SearchRepository, SearchResults
} from "~/components/shared/types/search";
import LfxSpinner from "~/components/uikit/spinner/spinner.vue";

const props = defineProps<{
  modelValue: boolean;
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: boolean): void }>();

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const searchInputRef = ref(null);

const search = ref<string>('');
const searchQuery = ref<string>('');
const loading = ref<boolean>(false);

const projects = ref<SearchProject[]>([]);
const repositories = ref<SearchRepository[]>([]);
const collections = ref<SearchCollection[]>([]);

const fetchSearchResults = () => {
  searchQuery.value = search.value;
  loading.value = true;
  ($fetch('/api/search', {
    query: {
      query: searchQuery.value,
    }
  }) as Promise<SearchResults>)
      .then((res: SearchResults) => {
        projects.value = res.projects;
        repositories.value = res.repositories;
        collections.value = res.collections;
      })
      .catch(() => {
        projects.value = [];
        repositories.value = [];
        collections.value = [];
      })
      .finally(() => {
        loading.value = false;
      });
}

const triggerSearch = () => {
  const val = search.value;
  setTimeout(() => {
    if (val === search.value) {
      fetchSearchResults();
    }
  }, 300);
}

onMounted(() => {
  searchInputRef.value.focus();
})
</script>

<script lang="ts">
export default {
  name: 'LfxSearchModal'
}
</script>
