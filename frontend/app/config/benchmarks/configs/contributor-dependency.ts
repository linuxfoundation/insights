import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const contributorDependency: BenchmarkConfigs = {
  key: BenchmarkKeys.ContributorDependency,
  points: [
    {
      pointStart: 0,
      pointEnd: 1,
      type: 'negative',
      description: '1 contributor accounts for 51%+ of contributions',
      text: `This project is highly dependent on a single contributor, 
        indicating an increased risk if that individual becomes unavailable.`
    },
    {
      pointStart: 2,
      pointEnd: 2,
      type: 'negative',
      description: '2 contributors account for 51%+ of contributions',
      text: `This project relies on only two contributors, suggesting limited participation 
        and vulnerability to disruptions if one contributor withdraws.`
    },
    {
      pointStart: 3,
      pointEnd: 4,
      type: 'warning',
      description: '3–4 contributors account for 51%+ of contributions',
      text: `This project shows modest contributor diversity, with a small group 
        driving the majority of contributions.`
    },
    {
      pointStart: 5,
      pointEnd: 6,
      type: 'warning',
      description: '5–6 contributors account for 51%+ of contributions',
      text: `This project has a moderate spread of contributions across several contributors, 
        indicating an improved level of resilience.`
    },
    {
      pointStart: 7,
      pointEnd: 9,
      type: 'positive',
      description: '7–9 contributors account for 51%+ of contributions',
      text: `This project benefits from strong contributor diversity, with responsibilities 
        well-distributed among a broader group of individuals.`
    },
    {
      pointStart: 10,
      pointEnd: null,
      type: 'positive',
      description: '10+ contributors account for 51%+ of contributions',
      text: `This project exhibits excellent contributor diversity, ensuring robust 
        support and a highly resilient development process.`
    }
  ],
  visibilityCheck: () => {
    console.log('checking!!');
    return true;
  }
};
