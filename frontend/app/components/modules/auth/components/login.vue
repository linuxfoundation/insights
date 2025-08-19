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
      @click="login()"
    >
      My account
    </lfx-button>
    <lfx-popover
      v-else
      v-model:visibility="isOpen"
      placement="bottom-end"
      class="cursor-pointer"
    >
      <lfx-avatar
        type="member"
        :src="'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlOLBRK-3wEFFeCojWlHou4nooggl5iI2PJQ&s'"
        size="small"
      />

      <template #content>

        <div 
          class="bg-white shadow-lg rounded-lg border border-neutral-200 w-56 p-1
          flex flex-col gap-1"
        >
          <!-- <lfx-button
            type="transparent"
            class="text-nowrap !text-neutral-900"
            size="small"
            @click="logoutHandler()"
          >
            Log Out
          </lfx-button>  -->
          <a
            :href="links.profileLink"
            target="_blank"
          >
            <lfx-menu-button
              class="!text-neutral-900 !rounded-md flex items-center gap-2"
            >
              <lfx-icon
                name="circle-user"
              />
              Manage profile
            </lfx-menu-button>
          </a>
          <lfx-menu-button
            class="!text-neutral-900 !rounded-md flex items-center gap-2"
            @click="logoutHandler()"
          >
            <lfx-icon
              name="arrow-right-from-bracket"
            />
            Log Out
          </lfx-menu-button>
        </div>
      </template>
    </lfx-popover>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRuntimeConfig } from 'nuxt/app';
import { useAuthStore } from '../store/auth.store';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import LfxPopover from "~/components/uikit/popover/popover.vue";
import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import { links } from '~/config/links';

const { loginWithRedirect, logout, isAuthenticated, getAccessTokenSilently } = useAuth0();
const { token } = storeToRefs(useAuthStore());

const isOpen = ref(false);

const login = async () => {
  loginWithRedirect({
    appState: {
      redirectTo: window.location.href,
    },
  })

  localStorage.setItem('lfx-login-redirect', window.location.href);
};

const logoutHandler = () => {
  const config = useRuntimeConfig();
  logout({ 
    logoutParams: { 
      returnTo: (config.public.appUrl as string) || window.location.origin 
    } 
  });
};

watch(isAuthenticated, async (newVal) => {
  if (newVal) {
    const tokenTmp = await getAccessTokenSilently();
    token.value = tokenTmp;
  } else {
    token.value = '';
  }
}, { immediate: true });
</script>

<script lang="ts">
export default {
  name: 'LfxAuthLogin',
}
</script>

<style scoped>

</style>