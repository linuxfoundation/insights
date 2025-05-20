// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from "nuxt/app";
import PackageDownloads from "./package-downloads.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const config = useRuntimeConfig()

const packageDownloads: WidgetConfig = {
    key: 'packageDownloads',
    name: 'Package downloads',
    description: () => '(TBD)',
    learnMoreLink: `${config.public.appUrl}/docs/metrics/popularity#package-downloads`,
    component: PackageDownloads,
    share: true,
    embed: false,
    snapshot: false,
}

export default packageDownloads;
