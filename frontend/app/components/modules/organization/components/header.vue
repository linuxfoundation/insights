<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-maintain-height
    :scroll-top="scrollTop"
    :class="scrollTop > 0 ? ['fixed', ...headerTopClass].join(' ') : 'relative'"
    class="z-10 w-full"
    :loaded="!!props.organization"
  >
    <div class="bg-white outline outline-1 outline-neutral-200">
      <section class="container">
        <div
          class="ease-linear transition-all"
          :class="isSticky ? 'py-3 lg:py-4' : 'py-3 lg:py-6'"
        >
          <div
            class="flex gap-4 ease-linear transition-all"
            :class="isSticky ? 'items-center' : 'items-start'"
          >
            <lfx-back class="ease-linear transition-all pr-1 sm:pr-4">
              <lfx-icon-button
                type="transparent"
                icon="angle-left"
              />
            </lfx-back>

            <!-- Logo: desktop only (in main flex row) -->
            <lfx-organization-logo
              :src="props.organization?.logo || ''"
              :size="isSticky ? 'normal' : 'large'"
              :alt="props.organization?.displayName"
              class="!hidden sm:!block flex-shrink-0 ease-linear transition-all"
            />

            <div
              class="min-w-0 flex-1 flex flex-col sm:flex-row sm:gap-3 ease-linear transition-all"
              :class="isSticky ? 'sm:items-center' : 'sm:items-start'"
            >
              <!-- Mobile top row: always visible, middle content transitions -->
              <div class="flex sm:hidden items-center gap-3">
                <lfx-organization-logo
                  :src="props.organization?.logo || ''"
                  size="large"
                  :alt="props.organization?.displayName"
                  class="flex-shrink-0"
                />

                <!-- Middle: spacer when expanded, name when sticky -->
                <div class="flex-1 min-w-0 overflow-hidden">
                  <Transition name="org-mobile-name">
                    <div
                      v-if="isSticky"
                      class="flex flex-col justify-center gap-0.5 min-w-0 overflow-hidden"
                    >
                      <h1 class="font-bold font-secondary text-heading-4 truncate min-w-0">
                        {{ props.organization?.displayName }}
                      </h1>
                    </div>
                  </Transition>
                </div>

                <lfx-icon-button
                  type="outline"
                  icon="share-nodes"
                  class="flex-shrink-0"
                  @click="handleShare"
                />
              </div>

              <!-- Content: name / description / meta — collapses on mobile when sticky -->
              <div
                class="org-header-body-wrap sm:flex-1 sm:min-w-0"
                :class="{ 'org-header-body-wrap--hidden': isSticky }"
              >
                <div class="org-header-body min-w-0">
                  <!-- Name row -->
                  <div class="flex items-center gap-3 flex-wrap">
                    <h1
                      class="font-bold font-secondary ease-linear transition-all duration-200 text-heading-4 line-clamp-1 truncate"
                      :class="isSticky ? 'md:text-heading-3' : 'md:text-heading-2'"
                    >
                      {{ props.organization?.displayName }}
                    </h1>
                  </div>

                  <!-- Description — hidden in sticky state -->
                  <p
                    v-if="props.organization?.description && !isSticky"
                    class="text-neutral-500 text-sm mt-1 max-w-3xl"
                  >
                    {{ props.organization?.description }}
                  </p>

                  <!-- Meta row — hidden in sticky state -->
                  <div
                    v-if="hasMetadata && !isSticky"
                    class="flex items-center gap-1.5 mt-5 flex-wrap"
                  >
                    <!-- Employees — no border, with icon -->
                    <lfx-tag
                      v-if="props.organization?.employeeCount"
                      size="small"
                      type="transparent"
                      class="!text-neutral-900 !font-normal"
                    >
                      <lfx-icon
                        name="people-group"
                        :size="12"
                        class="mr-1"
                      />
                      {{ props.organization!.employeeCount }} employees
                    </lfx-tag>

                    <!-- Separator before industry -->
                    <span
                      v-if="props.organization?.industry?.length && props.organization?.employeeCount"
                      class="text-neutral-400 select-none"
                      >・</span
                    >

                    <!-- Industry — no border, with icon -->
                    <lfx-tag
                      v-if="props.organization?.industry?.length"
                      size="small"
                      type="transparent"
                      class="!text-neutral-900 !font-normal"
                    >
                      <lfx-icon
                        name="tag"
                        :size="12"
                        class="mr-1"
                      />
                      {{ props.organization.industry.map(toSentenceCase).join(', ') }}
                    </lfx-tag>
                  </div>
                </div>
              </div>

              <!-- Right: actions — desktop only -->
              <div class="hidden sm:flex items-center gap-2 flex-shrink-0">
                <lfx-button
                  type="ghost"
                  size="medium"
                  button-style="pill"
                  class="h-9"
                  @click="handleShare"
                >
                  <lfx-icon
                    name="share-nodes"
                    :size="16"
                  />
                  Share
                </lfx-button>
                <lfx-tooltip
                  placement="top"
                  :allow-pass-through="true"
                >
                  <a
                    href="https://myorg.lfx.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="no-underline"
                  >
                    <lfx-button
                      type="transparent"
                      size="medium"
                      button-style="pill"
                      class="h-9"
                    >
                      <lfx-icon
                        name="arrow-up-right-from-square"
                        :size="14"
                      />
                      Open in LFX Self-Serve
                    </lfx-button>
                  </a>
                  <template #content>
                    <span class="whitespace-nowrap flex flex-col gap-0.5 items-center text-center">
                      <span class="font-semibold text-white">Working at {{ props.organization?.displayName }}?</span>
                      <span>Get person-level insights about your open source contributions</span>
                    </span>
                  </template>
                </lfx-tooltip>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </lfx-maintain-height>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { OrganizationProfile } from '~~/types/organization-page';
import LfxOrganizationLogo from '~/components/uikit/organization-logo/organization-logo.vue';
import LfxBack from '~/components/uikit/back/back.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxMaintainHeight from '~/components/uikit/maintain-height/maintain-height.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import useScroll from '~/components/shared/utils/scroll';
import { toSentenceCase } from '~/components/shared/utils/formatter';
import { useBannerStore } from '~/components/shared/store/banner.store';
import { useShareStore } from '~/components/shared/modules/share/store/share.store';

const props = defineProps<{
  organization: OrganizationProfile | undefined;
}>();

const { scrollTop } = useScroll();
const { headerTopClass } = storeToRefs(useBannerStore());
const { openShareModal } = useShareStore();

const isSticky = computed(() => scrollTop.value > 80);

const hasMetadata = computed(() => !!(props.organization?.employeeCount || props.organization?.industry?.length));

const handleShare = () => {
  const url = new URL(window.location.href);
  url.hash = '';
  openShareModal({
    url: url.toString(),
    title: `LFX Insights | ${props.organization?.displayName || 'Organization'}`,
    area: props.organization?.displayName,
  });
};
</script>

<script lang="ts">
export default {
  name: 'LfxOrgHeader',
};
</script>

<style lang="scss" scoped>
/* Mobile name/tag fade in when sticky */
.org-mobile-name-enter-active,
.org-mobile-name-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.org-mobile-name-enter-from,
.org-mobile-name-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* Mobile content area collapses smoothly when sticky — grid trick avoids max-height glitch */
.org-header-body-wrap {
  @media (max-width: 767px) {
    display: grid;
    grid-template-rows: 1fr;
    margin-top: 0.75rem; /* gap between top row and content — on wrapper so it collapses cleanly */
    opacity: 1;
    transition:
      grid-template-rows 0.3s ease,
      margin-top 0.3s ease,
      opacity 0.25s ease;

    &--hidden {
      grid-template-rows: 0fr;
      margin-top: 0;
      opacity: 0;
      pointer-events: none;
    }
  }
}

.org-header-body {
  @media (max-width: 767px) {
    overflow: hidden;
    min-height: 0; /* required for grid-template-rows: 0fr to fully collapse */
  }
}
</style>
