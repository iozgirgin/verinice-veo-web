/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from 'vitest';
import fixture from '../fixtures/tutorial-help-cases.json';

// Uses the same production Rollup YAML parser as the tutorial loader.
const modules = import.meta.glob<any>(
  ['../../content/tutorials/*.yaml', '!../../content/tutorials/10.riskdefinition.*.yaml'],
  { eager: true, import: 'default' }
);
const documents = (lang: string) =>
  Object.entries(modules)
    .filter(([path]) => path.endsWith(`.${lang}.yaml`))
    .sort(([a], [b]) => parseInt(a.split('/').pop()!) - parseInt(b.split('/').pop()!));
const tr = documents('tr');

describe('Turkish contextual help documents', () => {
  it('loads all eight active guides and 90 steps using the production YAML plugin', () => {
    expect(tr).toHaveLength(fixture.tutorialCount);
    expect(tr.reduce((sum, [, doc]) => sum + doc.steps.length, 0)).toBe(fixture.stepCount);
    expect(Object.keys(modules).some((path) => path.includes('10.riskdefinition'))).toBe(false);
  });
  it.each(tr)('%s retains routing and target selectors while localizing every step', (path, doc) => {
    const original = modules[path.replace('.tr.yaml', '.en.yaml')];
    expect(doc.lang).toBe('tr');
    expect(doc.stepNumbersOfLabel).toBe('/');
    expect(doc.route).toBe(original.route);
    expect(doc.exact).toBe(original.exact);
    expect(doc.steps.map((step: any) => step.element)).toEqual(original.steps.map((step: any) => step.element));
    expect([doc.nextLabel, doc.prevLabel, doc.doneLabel, doc.skipLabel]).toEqual(['İleri', 'Geri', 'Tamamla', 'Kapat']);
    doc.steps.forEach((step: any, index: number) => {
      expect(step.title.trim()).not.toBe('');
      expect(step.intro.trim()).not.toBe('');
      expect(step.intro).not.toBe(original.steps[index].intro);
      expect(step.intro).not.toMatch(/<script|onerror=|account-btn-en\.png/i);
    });
  });
  it.each(fixture.cases)('$caseId selects the Turkish help for the synthetic route', (testCase) => {
    const applicable = tr.filter(([, doc]) =>
      doc.exact ? doc.route === testCase.route : testCase.route.startsWith(doc.route)
    );
    expect(applicable.map(([, doc]) => doc.title)).toEqual(testCase.titles);
  });
});
