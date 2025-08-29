// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import DefaultTheme from 'vitepress/theme'
import './tailwind.postcss'
import './custom.css'
import './cssOverrides';

import { h } from 'vue'
import CustomLfxFooter from './components/CustomLfxFooter.vue'
import CustomNotFound from './components/CustomNotFound.vue'

export default {
    extends: DefaultTheme,
    Layout() {
        return h(DefaultTheme.Layout, null, {
            'layout-bottom': () => h(CustomLfxFooter),
            'not-found': () => h(CustomNotFound)
        })
    }
}
