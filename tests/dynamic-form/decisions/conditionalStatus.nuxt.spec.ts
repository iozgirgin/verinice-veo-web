/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from 'vitest';
import { addConditionalSchemaPropertiesToControlSchema } from '~/components/dynamic-form/util';
import fixture from '../../fixtures/kvkk-status-schema-cases.json';

describe('Conditional status options from a multi-subtype domain', () => {
  it.each(fixture.cases)('$caseId restricts $subType to its declared statuses', (testCase) => {
    const before = JSON.stringify(fixture.schema);
    const result = addConditionalSchemaPropertiesToControlSchema(
      fixture.schema,
      { subType: testCase.subType },
      fixture.schema.properties.status,
      '#/properties/status'
    );
    expect(result.enum).toEqual(testCase.expected);
    expect(new Set(result.enum).size).toBe(testCase.expected.length);
    expect(result.type).toBe('string');
    expect(result.minLength).toBe(1);
    expect(JSON.stringify(fixture.schema)).toBe(before);
  });

  it('applies an explicit else enum without retaining a prior option', () => {
    const schema = {
      properties: { status: { type: 'string', enum: ['A', 'B', 'C'] } },
      allOf: [
        {
          if: { properties: { subType: { const: 'Known' } } },
          then: { properties: { status: { enum: ['A'] } } },
          else: { properties: { status: { enum: ['B'] } } }
        }
      ]
    };
    expect(
      addConditionalSchemaPropertiesToControlSchema(
        schema as any,
        { subType: 'Other' },
        schema.properties.status as any,
        '#/properties/status'
      ).enum
    ).toEqual(['B']);
  });
});
