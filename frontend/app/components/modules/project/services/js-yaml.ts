// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {dump} from "js-yaml";

export const getYaml = (data: object): string => {
    let yaml = dump(data, {
        indent: 2,
        lineWidth: 80,
        noRefs: true,
        sortKeys: false,
        noArrayIndent: false,
        skipInvalid: true
    })
    yaml = yaml.replace(/\n\s*-\n\s+/g, '\n  - ');
    return yaml;
}
