import { describe, expect, it } from 'vitest';
import { TASK_STATUS, type Task } from '../domain/task';
import { SUPPORT_BUNDLE_VERSION, createSupportBundle, exportSupportBundleJson } from './supportBundle';

const sampleTask: Task = {
  id: 'task-1',
  title: 'Bundle me',
  status: TASK_STATUS.OPEN,
  createdAt: '2026-02-20T00:00:00.000Z',
  updatedAt: '2026-02-20T00:00:00.000Z',
  description: 'Contains private notes',
  completedAt: null,
  dueDate: null,
  priority: 'normal',
  estimatedDurationMin: null,
  energy: null,
  context: null
};

describe('support bundle export', () => {
  it('includes tasks and diagnostics, omits usage log when disabled', () => {
    const bundle = createSupportBundle({
      tasksState: { tasks: [sampleTask] },
      usageLogState: { enabled: false, entries: [] },
      diagnostics: { appVersion: '0.1.0', appCommitSha: 'abc1234' },
      exportedAt: '2026-02-20T03:00:00.000Z'
    });

    expect(bundle).toEqual({
      version: SUPPORT_BUNDLE_VERSION,
      exportedAt: '2026-02-20T03:00:00.000Z',
      diagnostics: { appVersion: '0.1.0', appCommitSha: 'abc1234' },
      privacy: { containsTaskData: true, includesUsageLog: false },
      payload: {
        tasks: {
          version: 2,
          payload: { tasks: [sampleTask] }
        },
        usageLog: null
      }
    });
  });

  it('includes usage log payload only when usage log is enabled', () => {
    const json = exportSupportBundleJson({
      tasksState: { tasks: [] },
      usageLogState: {
        enabled: true,
        entries: [
          {
            id: 'event-1',
            timestamp: '2026-02-20T03:01:00.000Z',
            eventType: 'task.created',
            details: { taskId: 'task-1' }
          }
        ]
      },
      diagnostics: { appVersion: '0.1.0', appCommitSha: 'abc1234' },
      exportedAt: '2026-02-20T03:02:00.000Z'
    });

    expect(JSON.parse(json)).toMatchObject({
      privacy: { includesUsageLog: true },
      payload: {
        usageLog: {
          version: 1,
          payload: {
            enabled: true,
            entries: [{ eventType: 'task.created' }]
          }
        }
      }
    });
  });
});
