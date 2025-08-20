// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { jwtVerify, createRemoteJWKSet } from 'jose';

const isJWT = (token: string) => {
  const parts = token.split('.');
  return parts.length === 3;
};

export default defineEventHandler(async (event) => {
  const url = getRouterParam(event, '_') || event.node.req.url || '';
  
  const protectedRoutes = [
    '/api/chat/',
  ];

  const isProtectedRoute = protectedRoutes.some(route => url.startsWith(route));
  
  if (!isProtectedRoute) {
    return;
  }

  const config = useRuntimeConfig()
  
  // Read authorization header
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401, 
      statusMessage: 'Authorization header required'
    });
  }

  const token = authHeader.substring(7);
  const auth0Domain = config.public.auth0Domain;
  const auth0ClientId = config.public.auth0ClientId;
  const auth0Audience = config.public.auth0Audience;

  if (!auth0Domain || !auth0ClientId) {
    throw createError({
      statusCode: 500, 
      statusMessage: 'Auth0 configuration missing'
    });
  }

  try {
    
    if (isJWT(token)) {
      const jwks = createRemoteJWKSet(new URL(`https://${auth0Domain}/.well-known/jwks.json`));
      
      const { payload } = await jwtVerify(token, jwks, {
        issuer: `https://${auth0Domain}/`,
        audience: auth0ClientId,
      });
      
      event.context.user = payload;

      const GROUP_CLAIM_KEY = 'https://sso.linuxfoundation.org/claims/groups'
      const GROUP_NAME = 'lfproducts-lfx-insights'

      if (!auth0Audience.includes('localhost') && !(payload[GROUP_CLAIM_KEY] as string[]).includes(GROUP_NAME)) {
        throw createError({
          statusCode: 401,
          statusMessage: `User does not belong to ${GROUP_NAME}`
        });
      }

    } else {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token format'
      });
    }
  } catch (jwtError) {
    console.error('JWT verification failed:', jwtError);
    throw createError({
      statusCode: 401, 
      statusMessage: 'Invalid JWT token'
    });
  }
});