<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white border-b border-neutral-200">
    <div class="container">
      <div class="flex items-center justify-between gap-3 py-5">
        <!-- Desktop: full tab row. Matches project-menu.vue's lg: breakpoint (1024px) so
        collection and project pages collapse to the dropdown fallback at the same width. -->
        <div class="lg:flex hidden items-center gap-3">
          <lfx-menu-button
            v-for="link of lfCollectionAggregateLinks"
            :key="link.key"
            :to="{ name: link.routeName, params: { slug: props.slug } }"
            :exact="true"
          >
            <template #default="{ isActive }">
              <lfx-icon
                :name="link.icon"
                :type="isActive ? 'solid' : 'light'"
              />
              {{ link.label }}
            </template>
          </lfx-menu-button>
        </div>
        <!-- Tablet/mobile: dropdown fallback, same pattern as project-menu.vue -->
        <div class="lg:hidden block min-w-0">
          <lfx-dropdown
            placement="bottom-start"
            width="15rem"
          >
            <template #trigger>
              <lfx-dropdown-selector>
                <lfx-icon
                  :name="activeLink?.icon || ''"
                  :size="16"
                  class="text-brand-500 font-black"
                />
                {{ activeLink?.label }}
              </lfx-dropdown-selector>
            </template>

            <router-link
              v-for="link of lfCollectionAggregateLinks"
              :key="link.key"
              :to="{ name: link.routeName, params: { slug: props.slug } }"
            >
              <lfx-dropdown-item
                :value="link.key"
                :label="link.label"
              />
            </router-link>
          </lfx-dropdown>
        </div>
        <lfx-project-date-range-picker
          v-if="showDateRangePicker"
          class="shrink-0"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'nuxt/app';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxMenuButton from '~/components/uikit/menu-button/menu-button.vue';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxProjectDateRangePicker from '~/components/modules/project/components/shared/header/date-range-picker.vue';
import { lfCollectionAggregateLinks } from '~/components/modules/collection/config/collection-links';

const props = defineProps<{
  slug: string;
  showDateRangePicker?: boolean;
}>();

const route = useRoute();
const activeLink = computed(
  () => lfCollectionAggregateLinks.find((link) => link.routeName === route.name) || lfCollectionAggregateLinks[0],
);
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionMenu',
};
</script>
