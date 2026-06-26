// docs/postcss.config.mjs

import { postcssIsolateStyles } from 'vitepress';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// vitepress-openapi is built with Tailwind v4, which uses native CSS @layer (theme, base,
// components). Our Tailwind v3 PostCSS plugin sees @layer base without a matching
// @tailwind base directive and throws. Fix: before Tailwind runs, detect files that have
// no @tailwind directives (i.e. external packages) and unwrap their @layer rules so the
// styles are still applied but Tailwind v3 never sees a bare @layer.
const unwrapExternalLayers = () => ({
  postcssPlugin: 'unwrap-external-layers',
  Once(root) {
    let hasTailwindDirective = false;
    root.walkAtRules('tailwind', () => {
      hasTailwindDirective = true;
      return false;
    });
    if (hasTailwindDirective) return;

    const layerRules = [];
    root.walkAtRules('layer', (rule) => layerRules.push(rule));
    for (const rule of layerRules) {
      rule.replaceWith(...(rule.nodes ?? []));
    }
  },
});
unwrapExternalLayers.postcss = true;

export default {
  plugins: [
    unwrapExternalLayers,
    tailwindcss,
    autoprefixer,
    // Isolate vitepress-openapi plugin styles from the rest of the docs
    postcssIsolateStyles({
      includeFiles: [/vitepress-openapi\.css/],
    }),
  ],
};
