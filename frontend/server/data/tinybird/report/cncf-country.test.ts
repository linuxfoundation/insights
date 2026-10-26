// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { mapCncfCountryOrganizations } from './cncf-country';

const organizationRow = {
  id: 'org-1',
  displayName: 'Scaleway',
  logo: '',
  slug: 'scaleway',
  contributorCount: 10,
  contributorInCountryCount: 10,
  contributionCount: 205,
};

describe('mapCncfCountryOrganizations', () => {
  test('turns the pipe headquartered flag into a boolean', () => {
    const result = mapCncfCountryOrganizations([
      { ...organizationRow, headquarteredInCountry: 1 },
      { ...organizationRow, id: 'org-2', headquarteredInCountry: 0 },
    ]);

    expect(result.map((org) => org.headquarteredInCountry)).toEqual([true, false]);
    expect(result[0]).toMatchObject({ displayName: 'Scaleway', contributorCount: 10 });
  });
});

describe('CNCF country fetchers', () => {
  const mockFetchFromTinybird = vi.fn();
  const filter = {
    countryCode: 'FR',
    startDate: DateTime.fromISO('2025-10-01'),
    endDate: DateTime.fromISO('2026-09-30'),
  };

  beforeEach(() => {
    mockFetchFromTinybird.mockReset();

    // The top-level import above cached a copy wired to the real '../tinybird'; reset the
    // registry so the dynamic re-import below picks up the mock.
    vi.resetModules();
    vi.doMock(import('../tinybird'), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  });

  test('summary sends only the country and period and returns the single pipe row', async () => {
    const { fetchCncfCountrySummary } = await import('./cncf-country');
    const summary = {
      contributorCount: 1386,
      contributionCount: 115216,
      organizationCount: 318,
      inCountryAtCountryOrganizationCount: 323,
      inCountryElsewhereCount: 871,
      abroadAtCountryOrganizationCount: 192,
    };
    mockFetchFromTinybird.mockResolvedValueOnce({ data: [summary] });

    const result = await fetchCncfCountrySummary(filter);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/cncf_country_summary.json',
      filter,
    );
    expect(result).toEqual(summary);
  });

  test('summary falls back to zeros when the pipe returns no row', async () => {
    const { fetchCncfCountrySummary } = await import('./cncf-country');
    mockFetchFromTinybird.mockResolvedValueOnce({ data: [] });

    const result = await fetchCncfCountrySummary(filter);

    expect(result.contributorCount).toBe(0);
    expect(result.abroadAtCountryOrganizationCount).toBe(0);
  });

  test('timeseries passes the granularity through', async () => {
    const { fetchCncfCountryTimeseries } = await import('./cncf-country');
    mockFetchFromTinybird.mockResolvedValueOnce({ data: [] });

    await fetchCncfCountryTimeseries({ ...filter, granularity: 'yearly' });

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/cncf_country_activity_timeseries.json',
      expect.objectContaining({ countryCode: 'FR', granularity: 'yearly' }),
    );
  });

  test('timeseries drops the period that starts on the exclusive endDate', async () => {
    const { fetchCncfCountryTimeseries } = await import('./cncf-country');
    const point = { endDate: '', contributorCount: 1, contributionCount: 1, organizationCount: 1 };
    mockFetchFromTinybird.mockResolvedValueOnce({
      data: [
        { ...point, startDate: '2026-09-01' },
        { ...point, startDate: '2026-10-01' },
      ],
    });

    const result = await fetchCncfCountryTimeseries({
      ...filter,
      endDate: DateTime.fromISO('2026-10-01'),
      granularity: 'monthly',
    });

    expect(result.data.map((p) => p.startDate)).toEqual(['2026-09-01']);
  });

  test('organizations maps the rows returned by the pipe', async () => {
    const { fetchCncfCountryOrganizations } = await import('./cncf-country');
    mockFetchFromTinybird.mockResolvedValueOnce({
      data: [{ ...organizationRow, headquarteredInCountry: 1 }],
    });

    const result = await fetchCncfCountryOrganizations({ ...filter, limit: 5 });

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/cncf_country_top_organizations.json',
      expect.objectContaining({ limit: 5 }),
    );
    expect(result.data[0]?.headquarteredInCountry).toBe(true);
  });
});
