// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from "nuxt/app";
import MailingListMessages from "./mailing-list-messages.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const config = useRuntimeConfig()

const mailingListMessages: WidgetConfig = {
    key: 'mailingListMessages',
    name: 'Mailing lists messages',
    description: () => 'Messages sent on the project\'s public mailing lists during the selected time period.',
    learnMoreLink: `${config.public.appUrl}/docs/metrics/popularity#mailing-list-messages`,
    component: MailingListMessages,
    share: true,
    embed: false,
    snapshot: false,
}

export default mailingListMessages;
