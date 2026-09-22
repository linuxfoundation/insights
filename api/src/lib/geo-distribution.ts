// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type } from '@sinclair/typebox';

type Noun = 'contributor' | 'organization';

type GeoRow<N extends Noun> = { country: string; flag: string; country_code: string } & Record<
  `${N}Count` | `${N}Percentage`,
  number
>;

const placement: Record<Noun, string> = {
  contributor: 'Each contributor is placed by the country on their profile, else their location',
  organization:
    'Each organization is placed by the country on its record, inferred from its location, else by its headquarters location',
};

const field = <K extends string, V>(key: K, value: V) => ({ [key]: value }) as Record<K, V>;

// The contributor and organization geo pipes differ only in the names of their count and share
// columns, so one noun builds the guard, the mapper and the item schema for either.
export function geoDistribution<N extends Noun>(noun: N) {
  const plural = `${noun}s` as const;
  const count = `${noun}Count` as const;
  const share = `${noun}Percentage` as const;

  const isRow = (row: GeoRow<N>) =>
    typeof row.country === 'string' &&
    typeof row.flag === 'string' &&
    typeof row.country_code === 'string' &&
    Number.isSafeInteger(row[count]) &&
    row[count] >= 0 &&
    typeof row[share] === 'number';

  const toItem = (row: GeoRow<N>) => ({
    country: row.country,
    countryCode: row.country_code,
    flag: row.flag,
    ...field(plural, row[count]),
    ...field(share, row[share]),
  });

  const Item = Type.Object({
    country: Type.String({
      description: `Name of the country in English, such as \`United States\`, or \`Unknown\` for ${plural} whose location names no country or who have none.`,
    }),
    countryCode: Type.String({
      description: 'ISO 3166-1 alpha-2 code of the country, such as `US`, or `XX` for `Unknown`.',
    }),
    flag: Type.String({
      description:
        "The country's flag emoji: the two Unicode regional indicator symbols that spell `countryCode`, or ❓ for `Unknown`.",
    }),
    ...field(
      plural,
      Type.Integer({
        description: `Active ${plural} in the period located in the country (count). ${placement[noun]}, matched to country names by containment, so one that names several countries, or a name inside another such as Niger in Nigeria, counts in each.`,
      }),
    ),
    ...field(
      share,
      Type.Number({
        description: `The country's share of the active ${plural} in the period, in percent, rounded to two decimals. Those counted in several countries count in each share, so the shares can add up to more than 100.`,
      }),
    ),
  });

  return { isRow, toItem, Item };
}
