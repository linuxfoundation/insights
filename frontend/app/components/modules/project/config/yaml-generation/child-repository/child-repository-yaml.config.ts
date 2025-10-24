// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import type { YamlGenerationConfig } from '~/components/modules/project/config/yaml-generation/yaml-generation.config';
import YamlChildRepositoryHeader from '~/components/modules/project/config/yaml-generation/child-repository/yaml-child-repository-header.vue';
import YamlChildRepository from '~/components/modules/project/config/yaml-generation/child-repository/yaml-child-repository.vue';
import YamlChildRepositoryTeamMembers from '~/components/modules/project/config/yaml-generation/child-repository/yaml-child-repository-team-members.vue';
import YamlChildRepositoryLicence from '~/components/modules/project/config/yaml-generation/child-repository/yaml-child-repository-licence.vue';
import YamlChildRepositorySecurity from '~/components/modules/project/config/yaml-generation/child-repository/yaml-child-repository-security.vue';

const childRepositoryYamlGenerationConfig: YamlGenerationConfig = {
  label: 'Child repository',
  icon: 'book',
  description: 'Individual repositories in a multi-repository project',
  features: [
    'Use in secondary repositories to inherit configuration from a centralized parent repository',
    'Must include header.project-si-source URL that points to the parent configuration file',
    'Reduces configuration duplication while ensuring consistency across multiple repositories',
  ],
  steps: [
    {
      label: 'Header information',
      component: YamlChildRepositoryHeader,
    },
    {
      label: 'Repository details',
      component: YamlChildRepository,
    },
    {
      label: 'Repository details | Core team members',
      component: YamlChildRepositoryTeamMembers,
    },
    {
      label: 'Repository details | License information',
      component: YamlChildRepositoryLicence,
    },
    {
      label: 'Repository details | Security self-assessment',
      component: YamlChildRepositorySecurity,
    },
  ],
  template: {
    header: {
      'schema-version': '2.0.0',
      'last-updated': DateTime.now().toISODate(),
      'last-reviewed': DateTime.now().toISODate(),
      url: '',
      'project-si-source': '',
    },
    repository: {
      url: '',
      status: '',
      'accepts-change-request': false,
      'accepts-automated-change-request': false,
      'core-team': [
        {
          name: '',
          affiliation: '',
          email: '',
          social: '',
          primary: false,
        },
      ],
      license: {
        url: '',
        expression: '',
      },
      security: {
        assessments: {
          self: {
            comment: '',
          },
        },
      },
    },
  },
};

export default childRepositoryYamlGenerationConfig;
