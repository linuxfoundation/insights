<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <a
      v-if="!isAuthenticated"
      href="/auth/auth0/login"
    >
      <lfx-button
        type="transparent"
        class="!rounded-full text-nowrap !text-brand-500"
      >
        My account
      </lfx-button>
    </a>
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
// import { storeToRefs } from 'pinia';
import { ref, computed, watch } from 'vue';
// import { useAuthStore } from '../store/auth.store';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import LfxPopover from "~/components/uikit/popover/popover.vue";
import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import { links } from '~/config/links';

// const { token } = storeToRefs(useAuthStore());

const { loggedIn, logout } = useOidcAuth()

// Use OIDC auth state instead of hardcoded values
const isAuthenticated = computed(() => loggedIn.value);

const isOpen = ref(false);

const logoutHandler = async () => {
  await logout();
};

const asyncToken = async () => {
  const idToken = await $fetch('/api/user/id-token');
  console.log('idToken', idToken);
}

watch(loggedIn, (newVal) => {
  // console.log('newVal', newVal);
  if (newVal) {
    asyncToken();
  }
}, { immediate: true });
// watch([isAuthenticated, idTokenClaims], ([newAuthVal, newIdTokenClaims]) => {
//   if (newAuthVal && newIdTokenClaims) {
//     try {
//       // The __raw property contains the actual JWT token
//       const idToken = newIdTokenClaims?.__raw;
//       token.value = idToken || '';
//     } catch (error) {
//       console.error('Error getting ID token:', error);
//       token.value = '';
//     }
//   } else {
//     token.value = '';
//   }
// }, { immediate: true });
</script>

<script lang="ts">
export default {
  name: 'LfxAuthLogin',
}
</script>

<style scoped>

</style>