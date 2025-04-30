import PackageDownloads from "./package-downloads.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const packageDownloads: WidgetConfig = {
    key: 'packageDownloads',
    name: 'Package downloads',
    description: () => '(TBD)',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: PackageDownloads,
}

export default packageDownloads;
