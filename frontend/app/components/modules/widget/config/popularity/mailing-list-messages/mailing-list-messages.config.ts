import MailingListMessages from "./mailing-list-messages.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const mailingListMessages: WidgetConfig = {
    key: 'mailingListMessages',
    name: 'Mailing lists messages',
    description: () => 'Messages sent on the project\'s public mailing lists during the selected time period.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: MailingListMessages,
    share: true,
    embed: false,
    snapshot: false,
}

export default mailingListMessages;
