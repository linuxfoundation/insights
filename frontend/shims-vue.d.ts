// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
declare module "*.vue" {
    import type { DefineComponent } from "vue";

    const component: DefineComponent<object, object, object>;
    export default component;
}
