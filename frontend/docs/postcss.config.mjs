// docs/postcss.config.mjs

import { postcssIsolateStyles } from 'vitepress';

export default {
  plugins: [
    // Make `::: raw` sections be isolated from vitepress-openapi plugin styles
    postcssIsolateStyles({
      includeFiles: [ /vitepress-openapi\.css/ ], // ← NOT `vitepress-openapi/dist/style.css` (!)
    }),
  ],
};