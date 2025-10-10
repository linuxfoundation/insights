<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <lfx-button
      v-if="!isAuthenticated"
      type="transparent"
      class="!rounded-full text-nowrap !text-brand-500"
      :disabled="isLoading"
      @click="loginHandler()"
    >
      <lfx-icon
        :name="isLoading ? 'spinner-third' : 'circle-user'"
        :class="isLoading ? 'animate-spin' : ''"
      />
      Log in
    </lfx-button>
    <lfx-popover
      v-else
      v-model:visibility="isOpen"
      placement="bottom-end"
      class="cursor-pointer"
    >
      <lfx-avatar
        type="member"
        :src="user?.picture || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlOLBRK-3wEFFeCojWlHou4nooggl5iI2PJQ&s'"
        size="small"
      />

      <template #content>

        <div 
          class="bg-white shadow-lg rounded-lg border border-neutral-200 w-56 p-1
          flex flex-col gap-1"
        >
          <a
            :href="links.profileLink"
            target="_blank"
          >
            <lfx-menu-button
              class="!text-neutral-900 !rounded-md flex !items-start gap-2"
            >
              <lfx-icon
                name="circle-user"
                class="mt-1"
              />
              <div class="flex-col gap-1">
                Manage profile
                <p class="text-xs text-neutral-500">
                  LFX Individual Dashboard
                </p>
              </div>
            </lfx-menu-button>

          </a>
          <lfx-menu-button
            class="!text-neutral-900 !rounded-md flex items-center gap-2"
            @click="logoutHandler()"
          >
            <lfx-icon
              name="arrow-right-from-bracket"
            />
            Log out
          </lfx-menu-button>
        </div>
      </template>
    </lfx-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '../store/auth.store';
import { useAuth } from '~~/composables/useAuth';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import LfxPopover from "~/components/uikit/popover/popover.vue";
import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import { links } from '~/config/links';

const { isAuthenticated, user, token, isLoading, login, logout } = useAuth();
const authStore = useAuthStore();

const isOpen = ref(false);

const loginHandler = async () => {
  const redirectTo = window.location.pathname + window.location.search + window.location.hash;
  await login(redirectTo);
};

const logoutHandler = async () => {
  document.cookie = 'auth_oidc_token=; Path=/; Max-Age=0; SameSite=None; Secure';
  await logout();
};

// Update auth store when authentication state changes
watch([isAuthenticated, token], ([newAuthVal, newToken]) => {
  authStore.isAuthenticated = newAuthVal;
  authStore.token = newToken || '';
  authStore.user = user.value;
}, { immediate: true });
</script>

<script lang="ts">
export default {
  name: 'LfxAuthLogin',
}
</script>

<style scoped>

</style>