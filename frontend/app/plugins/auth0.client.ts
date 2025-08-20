// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { createAuth0 } from '@auth0/auth0-vue'
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtPlugin((nuxt) => {
  const config = useRuntimeConfig()
  const auth0 = createAuth0({
    domain: config.public.auth0Domain as string,
    clientId: config.public.auth0ClientId as string,
    authorizationParams: {
      redirect_uri: config.public.auth0RedirectUri as string,
      audience: config.public.auth0Audience as string,
    },
  })

  nuxt.vueApp.use(auth0)
  
  return {
    provide: {
      auth0
    }
  }
}) 