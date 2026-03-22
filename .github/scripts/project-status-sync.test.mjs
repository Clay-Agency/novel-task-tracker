import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  evidenceIncludesPr,
  findCanonicalIssueItem,
  getTextFieldValue,
} = require('./project-status-sync.cjs');

describe('project-status-sync dedupe helpers', () => {
  it('reads text values by field name', () => {
    const value = getTextFieldValue(
      [
        { text: 'ignore', field: { name: 'Other' } },
        { text: 'PR: https://github.com/Clay-Agency/novel-task-tracker/pull/262', field: { name: 'Evidence' } },
      ],
      'Evidence'
    );

    expect(value).toContain('/pull/262');
  });

  it('matches PR URLs in evidence text case-insensitively', () => {
    expect(
      evidenceIncludesPr({
        evidenceText: 'PR: HTTPS://github.com/Clay-Agency/novel-task-tracker/pull/262',
        prUrl: 'https://github.com/Clay-Agency/novel-task-tracker/pull/262',
      })
    ).toBe(true);
  });

  it('returns the canonical issue item only when evidence already contains the PR URL', () => {
    const issues = [
      {
        number: 260,
        projectItems: {
          nodes: [
            {
              id: 'ITEM_ISSUE_260',
              project: { number: 1 },
              fieldValues: {
                nodes: [
                  { text: 'PR: https://github.com/Clay-Agency/novel-task-tracker/pull/261', field: { name: 'Evidence' } },
                ],
              },
            },
          ],
        },
      },
      {
        number: 262,
        projectItems: {
          nodes: [
            {
              id: 'ITEM_ISSUE_262',
              project: { number: 1 },
              fieldValues: {
                nodes: [
                  { text: 'PR: https://github.com/Clay-Agency/novel-task-tracker/pull/262', field: { name: 'Evidence' } },
                ],
              },
            },
          ],
        },
      },
    ];

    const canonical = findCanonicalIssueItem({
      issues,
      projectNumber: 1,
      prUrl: 'https://github.com/Clay-Agency/novel-task-tracker/pull/262',
      evidenceFieldName: 'Evidence',
    });

    expect(canonical).toMatchObject({
      itemId: 'ITEM_ISSUE_262',
      issue: { number: 262 },
    });
  });

  it('returns null when the controlling issue is in project but evidence does not confirm the PR relationship', () => {
    const issues = [
      {
        number: 262,
        projectItems: {
          nodes: [
            {
              id: 'ITEM_ISSUE_262',
              project: { number: 1 },
              fieldValues: {
                nodes: [{ text: 'CI: https://github.com/Clay-Agency/novel-task-tracker/actions/runs/1', field: { name: 'Evidence' } }],
              },
            },
          ],
        },
      },
    ];

    const canonical = findCanonicalIssueItem({
      issues,
      projectNumber: 1,
      prUrl: 'https://github.com/Clay-Agency/novel-task-tracker/pull/262',
      evidenceFieldName: 'Evidence',
    });

    expect(canonical).toBeNull();
  });
});
