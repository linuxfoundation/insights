import { dateOptKeys } from '~/components/modules/project/config/date-options';
import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const retention: BenchmarkConfigs = {
  key: BenchmarkKeys.Retention,
  points: [
    {
      pointStart: 0,
      pointEnd: 9,
      type: 'negative',
      description: 'Less than 10% of contributors are contributing quarter over quarter',
      text: `This project has extremely low contributor retention, 
      indicating that nearly all contributors disengage after a single quarter.`
    },
    {
      pointStart: 10,
      pointEnd: 29,
      type: 'negative',
      description: '10–29% of contributors are contributing quarter over quarter',
      text: `This project has very low retention, 
      suggesting difficulty in keeping contributors engaged over time.`
    },
    {
      pointStart: 30,
      pointEnd: 49,
      type: 'warning',
      description: '30–49% of contributors are contributing quarter over quarter',
      text: `This project demonstrates modest retention, 
      with fewer than half of contributors returning in subsequent quarters.`
    },
    {
      pointStart: 50,
      pointEnd: 64,
      type: 'warning',
      description: '50–64% of contributors are contributing quarter over quarter',
      text: `This project shows decent retention, 
      with a majority of contributors continuing their involvement.`
    },
    {
      pointStart: 65,
      pointEnd: 79,
      type: 'positive',
      description: '65–79% of contributors are contributing quarter over quarter',
      text: `This project benefits from strong retention, 
      reflecting an engaged and consistent contributor base.`
    },
    {
      pointStart: 80,
      pointEnd: null,
      type: 'positive',
      description: '80% or more of contributors are contributing quarter over quarter',
      text: `This project exhibits excellent retention, 
      with most contributors staying active across quarters, indicating a highly engaged and stable community.`
    }
  ],
  visibilityCheck: (
    selectedTimeRangeKey: string,
    _startDate: string,
    _endDate: string,
    additionalCheck?: boolean
  ) => {
    if (selectedTimeRangeKey === dateOptKeys.previousQuarter && additionalCheck) {
      return true;
    }
    return false;
  }
};
