import {
  geographicalDistributionMock,
  organizationGeographicalDistributionMock
} from '~~/server/mocks/geographical-distribution.mock';

/**
 * Frontend expects the data to be in the following format:
 * {
 *   summary: {
 *     totalContributions: number;
 *     periodFrom: string;
 *     periodTo: string;
 *   },
 *   data: [{
 *     name: string; // Country Name
 *     code: string; // country code
 *     flag: string; // flag url
 *     contribution: number; // total contribution of contributors or organizations in that country
 *     percentage: number; // percentage of the contribution based on the total
 *   }]
 * }
 */
/**
 * Query params:
 * - type: 'contributors' | 'organizations'
 * - project: string
 * - repository: string
 * - time-period: string
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  if (query.type === 'contributors') {
    return geographicalDistributionMock;
  }

  return organizationGeographicalDistributionMock;
});
