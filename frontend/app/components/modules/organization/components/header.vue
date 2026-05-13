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
          :class="scrollTop > 50 ? 'py-3 lg:py-4' : 'py-3 lg:py-6'"
        >
          <div
            class="flex gap-4 ease-linear transition-all"
            :class="scrollTop > 50 ? 'items-center' : 'items-start'"
          >
            <lfx-back class="ease-linear transition-all pr-1 sm:pr-4">
              <lfx-icon-button
                type="transparent"
                icon="angle-left"
              />
            </lfx-back>

            <lfx-organization-logo
              :src="props.organization?.logo || ''"
              :size="scrollTop > 50 ? 'normal' : 'large'"
              :alt="props.organization?.displayName"
              class="flex-shrink-0 ease-linear transition-all"
            />

            <div class="min-w-0 flex-1 flex items-start justify-between gap-3">
              <!-- Left: name / description / meta -->
              <div class="min-w-0 flex-1">
                <!-- Name row — membership badge (outline) appears here in sticky state -->
                <div class="flex items-center gap-3 flex-wrap">
                  <h1
                    class="font-bold font-secondary ease-linear transition-all duration-200 text-heading-4 line-clamp-1 truncate"
                    :class="scrollTop > 50 ? 'md:text-heading-3' : 'md:text-heading-2'"
                  >
                    {{ props.organization?.displayName }}
                  </h1>
                  <lfx-tooltip
                    v-if="props.organization?.membershipTier && scrollTop > 50"
                    placement="top"
                  >
                    <a
                      href="https://www.linuxfoundation.org/about/members"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="no-underline flex-shrink-0 inline-flex items-center"
                    >
                      <lfx-tag
                        size="small"
                        type="outline"
                        class="hover:!bg-neutral-50 transition-colors"
                      >
                        <img
                          src="~/assets/images/icon.svg"
                          alt=""
                          class="inline-block w-3.5 h-3.5 mr-1 align-middle"
                        />{{ tierLabel }}
                      </lfx-tag>
                    </a>
                    <template #content>
                      <span class="whitespace-nowrap inline-flex items-center gap-1">
                        Know more about Linux Foundation memberships
                        <lfx-icon
                          name="arrow-up-right-from-square"
                          :size="10"
                        />
                      </span>
                    </template>
                  </lfx-tooltip>
                </div>

                <!-- Description — hidden in sticky state -->
                <p
                  v-if="props.organization?.description && scrollTop <= 50"
                  class="text-neutral-500 text-sm mt-1 max-w-3xl"
                >
                  {{ props.organization?.description }}
                </p>

                <!-- Meta row — hidden in sticky state -->
                <div
                  v-if="(props.organization?.membershipTier || hasMetadata) && scrollTop <= 50"
                  class="flex items-center gap-1.5 mt-3 flex-wrap"
                >
                  <!-- Membership badge — outline with border -->
                  <lfx-tooltip
                    v-if="props.organization?.membershipTier"
                    placement="top"
                  >
                    <a
                      href="https://www.linuxfoundation.org/about/members"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="no-underline inline-flex items-center"
                    >
                      <lfx-tag
                        size="small"
                        type="outline"
                        class="hover:!bg-neutral-50 transition-colors"
                      >
                        <img
                          src="~/assets/images/icon.svg"
                          alt=""
                          class="inline-block w-3.5 h-3.5 mr-1 align-middle"
                        />{{ tierLabel }}
                      </lfx-tag>
                    </a>
                    <template #content>
                      <span class="whitespace-nowrap inline-flex items-center gap-1">
                        Know more about Linux Foundation memberships
                        <lfx-icon
                          name="arrow-up-right-from-square"
                          :size="10"
                        />
                      </span>
                    </template>
                  </lfx-tooltip>

                  <!-- Separator before employees -->
                  <span
                    v-if="props.organization?.membershipTier && props.organization?.employeeCount"
                    class="text-neutral-400 select-none"
                    >・</span
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
                    {{ employeeRange }} employees
                  </lfx-tag>

                  <!-- Separator before industry -->
                  <span
                    v-if="
                      props.organization?.industry?.length &&
                      (props.organization?.membershipTier || props.organization?.employeeCount)
                    "
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
                    {{ props.organization.industry.join(', ') }}
                  </lfx-tag>
                </div>
              </div>

              <!-- Right: actions — always visible -->
              <div class="flex items-center gap-2 flex-shrink-0">
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
                <lfx-tooltip placement="top">
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
import { useBannerStore } from '~/components/shared/store/banner.store';
import { useShareStore } from '~/components/shared/modules/share/store/share.store';

const props = defineProps<{
  organization: OrganizationProfile | undefined;
}>();

const { scrollTop } = useScroll();
const { headerTopClass } = storeToRefs(useBannerStore());
const { openShareModal } = useShareStore();

const employeeRange = computed(() => {
  const count = props.organization?.employeeCount;
  if (!count) return '';
  if (count <= 10) return '1-10';
  if (count <= 50) return '11-50';
  if (count <= 200) return '51-200';
  if (count <= 500) return '201-500';
  if (count <= 1000) return '501-1,000';
  if (count <= 5000) return '1,001-5,000';
  if (count <= 10000) return '5,001-10,000';
  return '10,001+';
});

const hasMetadata = computed(() => !!(props.organization?.employeeCount || props.organization?.industry?.length));

const tierLabel = computed(() => {
  const tier = props.organization?.membershipTier;
  if (!tier) return '';
  return `${tier.charAt(0).toUpperCase()}${tier.slice(1)} Member`;
});

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
