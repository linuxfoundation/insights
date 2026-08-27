// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import DOMPurify from 'isomorphic-dompurify';

export const useSanitize = () => {
  const sanitize = (dirty: string, config?: DOMPurify.Config) => DOMPurify.sanitize(dirty, config);

  return { sanitize };
};
