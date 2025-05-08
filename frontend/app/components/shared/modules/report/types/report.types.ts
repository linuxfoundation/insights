// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {WidgetArea} from "~/components/modules/widget/types/widget-area";

export interface ReportDataForm {
    area: WidgetArea;
    widget: string;
    description: string;
    email: string;
}
