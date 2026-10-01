// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type } from '@sinclair/typebox';
import { describe, expect, it } from 'vitest';

import { collectionSchema, collectionText } from '../src/lib/widget-scope.js';

describe('collectionText', () => {
  it.each([
    ["Returns the project's contributors.", "Returns the collection's contributors."],
    [
      'Organizations contributing to the project, ranked.',
      'Organizations contributing to the collection, ranked.',
    ],
    ['Maintainers of a project repository.', 'Maintainers of a collection repository.'],
    [
      'Used by a project outside the Linux Foundation.',
      'Used by a project outside the Linux Foundation.',
    ],
    ['Counts. An unknown project gets an empty list.', 'Counts.'],
    ['Counts. An unknown project returns zeros and an empty `data` list. Next.', 'Counts. Next.'],
    [
      'An unknown project, or a period without matching contributions, returns zero counts.',
      'A period without matching contributions returns zero counts.',
    ],
    [
      'An unknown project or a pipe with no data returns an empty list.',
      'A pipe with no data returns an empty list.',
    ],
    ['One row per month. Empty for an unknown project.', 'One row per month.'],
    [
      'The volume covers the whole project, so there is no repository filter.',
      'The volume covers the whole collection, so there is no repository filter.',
    ],
    [
      'Google searches for the project name that month.',
      'Google searches for the member project names that month, added up.',
    ],
    [
      'Returns the monthly Google Search volume for the project name, one row per month.',
      'Returns the monthly Google Search volume for the member project names, added up, one row per month.',
    ],
    [
      'One summary per metric: the highest value any one matching package reported on a single day of the period.',
      'One summary per metric: the sum over member projects of the highest value any one of their matching packages reported on a single day of the period.',
    ],
    [
      'Highest running download total of one package',
      'Highest running download total of one package, summed over the member projects',
    ],
    [
      'Most repositories depending on one package on a single day',
      'Most repositories depending on one package on a single day, summed over the member projects',
    ],
    ['Pass `name` to read one package.', 'Pass `name` to read one package.'],
    ['`repos` narrows it to those repositories. Next.', 'Next.'],
    ['Narrows. `repos` narrows every count to those repositories. Next.', 'Narrows. Next.'],
    [
      "Roles the contributor holds in the project's repositories, or only in `repos` when given: `maintainer`.",
      "Roles the contributor holds in the collection's repositories: `maintainer`.",
    ],
    [
      'One of the platforms that `GET /v1-alpha/projects/{slug}/activity-types` lists for the project.',
      'One of the platforms that `GET /v1-alpha/projects/{slug}/activity-types` lists for a project of the collection.',
    ],
  ])('rewrites %j', (input, expected) => {
    expect(collectionText(input)).toBe(expected);
  });
});

describe('collectionSchema', () => {
  const Leaf = Type.Object({ n: Type.Integer({ description: 'Count.' }) }, { title: 'Leaf' });
  const Edited = Type.Object(
    { id: Type.String({ description: 'Unchanged.' }) },
    { title: 'Edited', description: "The project's rows. An unknown project gets an empty list." },
  );
  const Root = Type.Object({ leaf: Leaf, edited: Edited, list: Type.Array(Edited) });

  it('rewrites descriptions at any depth and leaves the source schema alone', () => {
    const out = collectionSchema(Root) as typeof Root;
    expect(out.properties.edited.description).toBe("The collection's rows.");
    expect(out.properties.list.items.description).toBe("The collection's rows.");
    expect(Root.properties.edited.description).toContain('unknown project');
  });

  it('drops the title of a rewritten schema and keeps the rest shared', () => {
    const out = collectionSchema(Root) as typeof Root;
    expect(out.properties.edited.title).toBeUndefined();
    expect(out.properties.leaf).toBe(Leaf);
  });
});
