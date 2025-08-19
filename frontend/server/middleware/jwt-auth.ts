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

  // Read authorization header
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401, 
      statusMessage: 'Authorization header required'
    });
  }

  const token = authHeader.substring(7);
  const auth0Domain = process.env.NUXT_CROWD_LFX_AUTH0_DOMAIN;
  const auth0Audience = process.env.NUXT_CROWD_LFX_AUTH0_AUDIENCE;

  if (!auth0Domain || !auth0Audience) {
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
        audience: auth0Audience,
      });
      
      event.context.user = payload;
      console.log('User authenticated:', payload);

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