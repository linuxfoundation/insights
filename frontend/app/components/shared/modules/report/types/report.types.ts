import type {WidgetArea} from "~/components/modules/widget/types/widget-area";

export interface ReportDataForm {
    area: WidgetArea;
    widget: string;
    description: string;
    email: string;
}
