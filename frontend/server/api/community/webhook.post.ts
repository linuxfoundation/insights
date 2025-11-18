// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export default defineEventHandler(async (event): Promise<boolean> => {
  const query = getQuery(event);

  const body = await readBody(event);
  console.log('QUERY', query);
  console.log('BODY', body);
  return true;
});
