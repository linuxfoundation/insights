// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from "nuxt/app";
import Stars from "./stars.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const config = useRuntimeConfig()

const stars: WidgetConfig = {
    key: 'stars',
    name: 'Stars',
    description: () => 'New stars added to the project repositories during the selected time period.',
    learnMoreLink: `${config.public.appUrl}/docs/metrics/popularity#stars`,
    component: Stars,
    share: true,
    embed: false,
    snapshot: false,
}

export default stars;
