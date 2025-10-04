// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {DateTime} from 'luxon';
import type {YamlGenerationConfig} from "~/components/modules/project/config/yaml-generation/yaml-generation.config";
import YamlHeaderInformation
    from "~/components/modules/project/config/yaml-generation/shared/yaml-header-information.vue";

const comprehensiveYamlGenerationConfig: YamlGenerationConfig = {
    label: 'Comprehensive',
    icon: 'file-shield',
    description: 'Comprehensive security documentation and planning.',
    features: [
        'Use as a reference for all possible specification sections.',
        'Ideal for identifying areas for future improvement.',
        'Helps plan long-term security investments and prioritisation.'
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
                'This file contains all possible information for both project and repository,\n' +
                'though it is not required to include all of this information every time.\n' +
                'Nor is it required to include both a project and repository section if the project\n' +
                'section is intended to be inherited by repositories via header.project-si-source'
        },
        project: {
            name: '',
            homepage: '',
            funding: '',
            roadmap: '',
            steward: {
                uri: '',
                comment: ''
            },
            administrators: [],
            documentation: {
                'quickstart-guide': '',
                'detailed-guide': '',
                'code-of-conduct': '',
                'release-process': '',
                'support-policy': '',
                'signature-verification': ''
            },
            repositories: [],
            'vulnerability-reporting': {
                'reports-accepted': true,
                'bug-bounty-available': true,
                'bug-bounty-program': '',
                contact: {
                    name: '',
                    email: '',
                    primary: true
                },
                'security-policy': '',
                'in-scope': [],
                'out-of-scope': [],
                'pgp-key': '',
                comment: ''
            }
        },
        repository: {
            url: '',
            status: '',
            'bug-fixes-only': false,
            'accepts-change-request': true,
            'accepts-automated-change-request': true,
            'no-third-party-packages': false,
            'core-team': [],
            documentation: {
                'contributing-guide': '',
                'review-policy': '',
                'security-policy': '',
                governance: '',
                'dependency-management-policy': ''
            },
            license: {
                url: '',
                expression: ''
            },
            release: {
                changelog: '',
                'automated-pipeline': true,
                attestations: [],
                'distribution-points': [],
                license: {
                    url: '',
                    expression: ''
                }
            },
            security: {
                assessments: {
                    self: {
                        evidence: '',
                        date: '',
                        comment: ''
                    },
                    'third-party': []
                },
                champions: [],
                tools: []
            }
        }
    }
}

export default comprehensiveYamlGenerationConfig;
