// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {DateTime} from 'luxon';
import type {YamlGenerationConfig} from "~/components/modules/project/config/yaml-generation/yaml-generation.config";
import YamlHeaderInformation
    from "~/components/modules/project/config/yaml-generation/shared/yaml-header-information.vue";

const multiRepositoryYamlGenerationConfig: YamlGenerationConfig = {
    label: 'Multi-repository',
    icon: 'folder-tree',
    description: 'Multi-repository projects with centralized security policies.',
    features: [
        'Use as the master security insights file in your main repository',
        'Define detailed, reusable project security configurations',
        'Must be accessible via unauthenticated GET request returning text/plain or application/yaml'
    ],
    steps: [
        {
            label: 'Header information',
            component: YamlHeaderInformation,
        }
    ],
    template: {
        header: {
            'schema-version': '2.0.0',
            'last-updated': DateTime.now().toISODate(),
            'last-reviewed': DateTime.now().toISODate(),
            url: '',
            comment:
                'This file contains the minimum information for both project and repository.\n' +
                'It not required to include both a project and repository section if the project\n' +
                'section is intended to be inherited by repositories via header.project-si-source'
        },
        project: {
            name: '',
            administrators: [],
            repositories: [],
            'vulnerability-reporting': {
                'reports-accepted': true,
                'bug-bounty-available': true
            }
        },
        repository: {
            url: '',
            status: '',
            'accepts-change-request': true,
            'accepts-automated-change-request': true,
            'core-team': [],
            license: {
                url: '',
                expression: ''
            },
            security: {
                assessments: {
                    self: {
                        comment: ''
                    }
                }
            }
        }
    }
}

export default multiRepositoryYamlGenerationConfig;
