<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <lfx-button
      v-if="!isAuthenticated"
      type="tertiary"
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

        <div class="bg-white shadow-lg rounded-lg border border-neutral-200">
          <div class="p-3">
            <lfx-button
              type="transparent"
              class="text-nowrap !text-brand-500"
              @click="logoutHandler()"
            >
              Log Out
            </lfx-button> 
          </div>
        </div>
      </template>
    </lfx-popover>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useAuthStore } from '../store/auth.store';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import LfxPopover from "~/components/uikit/popover/popover.vue";

const { loginWithRedirect, logout, isAuthenticated, getAccessTokenSilently } = useAuth0();
const { token } = storeToRefs(useAuthStore());

const isOpen = ref(false);

const login = async () => {
  loginWithRedirect()
};

const logoutHandler = () => {
  logout();
};

watch(isAuthenticated, async (newVal) => {
  if (newVal) {
    const tokenTmp = await getAccessTokenSilently();
    token.value = tokenTmp;
  } else {
    token.value = '';
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxAuthLogin',
}
</script>

<style scoped>

</style>