// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { type User } from '~~/types/auth/auth-user.types'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const token = ref('')
  const user = ref<User | null>(null)
  const hasLfxInsightsPermission = computed(() => user.value?.hasLfxInsightsPermission || false)

  return {
    isAuthenticated,
    token,
    user,
    hasLfxInsightsPermission,
  }
})
