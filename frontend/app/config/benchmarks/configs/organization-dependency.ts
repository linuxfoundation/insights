import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const organizationDependency: BenchmarkConfigs = {
  title: 'Organization Dependency',
  key: BenchmarkKeys.OrganizationDependency,
  points: [
    {
      pointStart: 0,
      pointEnd: 1,
      type: 'negative',
      description: '1 organization accounts for 51%+ of contributions',
      text: `This project is highly dependent on a single organization, 
      indicating a lack of diverse organizational support.`
    },
    {
      pointStart: 2,
      pointEnd: 2,
      type: 'negative',
      description: '2 organizations account for 51%+ of contributions',
      text: `This project mainly relies on only two organizations, 
      which suggests limited organizational diversity and potential risk if one withdraws.`
    },
    {
      pointStart: 3,
      pointEnd: 3,
      type: 'warning',
      description: '3 organizations account for 51%+ of contributions',
      text: `This project shows modest organizational diversity, 
      with a small number of organizations driving the majority of contributions.`
    },
    {
      pointStart: 4,
      pointEnd: 5,
      type: 'warning',
      description: '4-5 organizations account for 51%+ of contributions',
      text: `This project has a moderate spread of contributions across several organizations, 
      reducing dependency on any single entity.`
    },
    {
      pointStart: 6,
      pointEnd: 7,
      type: 'positive',
      description: '6–7 organizations account for 51%+ of contributions',
      text: `This project benefits from strong organizational diversity, 
      with contributions well-distributed across many organizations.`
    },
    {
      pointStart: 8,
      pointEnd: null,
      type: 'positive',
      description: '8 or more organizations account for 51%+ of contributions',
      text: `This project exhibits excellent organizational diversity, 
      ensuring robust support and resilience through a wide range of contributing organizations.`
    }
  ],
  visibilityCheck: () => true
};
