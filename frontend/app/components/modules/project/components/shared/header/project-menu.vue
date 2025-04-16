<template>
  <div class="flex sm:hidden lg:flex items-center gap-3">
    <lfx-tooltip
      v-for="link of lfProjectLinks"
      :key="link.label"
      content="Coming soon"
      placement="top"
      :disabled="!link.comingSoon"
    >
      <lfx-menu-button
        :to="!link.comingSoon ? {
          name: repoName ? link.repoRouteName : link.projectRouteName
        } : undefined"
        :disabled="link.comingSoon"
      >
        <lfx-icon :name="link.icon" />
        {{ link.label }}
      </lfx-menu-button>
    </lfx-tooltip>
  </div>
  <div class="hidden sm:block lg:hidden">
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
          {{activeLink?.label}}
        </lfx-dropdown-selector>
      </template>

      <template
        v-for="link of lfProjectLinks"
        :key="link.label"
      >

        <router-link
          v-if="!link.comingSoon"
          :to="{
            name: repoName ? link.repoRouteName : link.projectRouteName
          }"
        >
          <lfx-dropdown-item
            :value="repoName ? link.repoRouteName : link.projectRouteName"
            :label="link.label"
          >
            <!--            <lfx-icon-->
            <!--              :name="link.icon"-->
            <!--              :class="{'font-black !text-brand-500': activeLink?.key === link.key}"-->
            <!--            />-->
            <!--            <span :class="{'font-medium': activeLink?.key === link.key}">-->
            <!--              {{ link.label }}-->
            <!--            </span>-->
          </lfx-dropdown-item>
        </router-link>

      </template>
    </lfx-dropdown>

  </div>
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {computed} from "vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxTooltip from "~/components/uikit/tooltip/tooltip.vue";
import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
import LfxDropdown from "~/components/uikit/dropdown/dropdown.vue";
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import {lfProjectLinks} from "~/components/modules/project/config/links";

const route = useRoute();
const repoName = computed(() => route.params.name as string);

const activeLink = computed(() => lfProjectLinks.find((link) => (repoName.value
      ? link.repoRouteName === route.name
      : link.projectRouteName === route.name)));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectMenu'
};
</script>
