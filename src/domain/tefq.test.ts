import { describe, expect, it } from 'vitest';
import { TASK_ENERGY, TASK_PRIORITY, TASK_STATUS, type Task } from './task';
import { buildNowQueue } from './tefq';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'id' in overrides ? (overrides.id as string) : 'task-1',
    title: 'title' in overrides ? (overrides.title as string) : 'Task',
    status: 'status' in overrides ? (overrides.status as Task['status']) : TASK_STATUS.OPEN,
    createdAt: 'createdAt' in overrides ? (overrides.createdAt as string) : '2026-02-19T00:00:00.000Z',
    updatedAt: 'updatedAt' in overrides ? (overrides.updatedAt as string) : '2026-02-19T00:00:00.000Z',
    description: null,
    completedAt: null,
    dueDate: 'dueDate' in overrides ? (overrides.dueDate ?? null) : null,
    priority: 'priority' in overrides ? (overrides.priority as Task['priority']) : TASK_PRIORITY.NORMAL,
    estimatedDurationMin:
      'estimatedDurationMin' in overrides ? (overrides.estimatedDurationMin ?? null) : 30,
    energy: 'energy' in overrides ? (overrides.energy ?? null) : TASK_ENERGY.MEDIUM,
    context: 'context' in overrides ? (overrides.context ?? null) : null
  };
}

describe('buildNowQueue', () => {
  it('ranks tasks deterministically by score and tie-breakers', () => {
    const tasks = [
      makeTask({
        id: 'later-due',
        title: 'Later due',
        dueDate: '2026-02-21',
        priority: TASK_PRIORITY.HIGH,
        createdAt: '2026-02-19T01:00:00.000Z'
      }),
      makeTask({
        id: 'earlier-due',
        title: 'Earlier due',
        dueDate: '2026-02-20',
        priority: TASK_PRIORITY.HIGH,
        createdAt: '2026-02-19T02:00:00.000Z'
      }),
      makeTask({
        id: 'earlier-created',
        title: 'Earlier created',
        dueDate: null,
        priority: TASK_PRIORITY.NORMAL,
        createdAt: '2026-02-18T23:00:00.000Z'
      })
    ];

    const queue = buildNowQueue(tasks, {
      availableTimeMin: 30,
      currentEnergy: TASK_ENERGY.MEDIUM,
      now: '2026-02-19T00:00:00.000Z'
    });

    expect(queue.items.map(({ task }) => task.id)).toEqual(['earlier-due', 'later-due', 'earlier-created']);
    expect(queue.items[0].reasons).toEqual(expect.arrayContaining(['fits 30m', 'energy match']));
  });

  it('excludes completed and metadata-missing tasks from eligible list', () => {
    const tasks = [
      makeTask({ id: 'completed', status: TASK_STATUS.COMPLETED }),
      makeTask({ id: 'missing-duration', estimatedDurationMin: null }),
      makeTask({ id: 'missing-energy', energy: null }),
      makeTask({ id: 'eligible' })
    ];

    const queue = buildNowQueue(tasks, {
      availableTimeMin: 30,
      currentEnergy: TASK_ENERGY.MEDIUM
    });

    expect(queue.eligibleCount).toBe(1);
    expect(queue.items).toHaveLength(1);
    expect(queue.items[0].task.id).toBe('eligible');
  });

  it('scores due windows with non-negative boundaries and keeps overdue neutral', () => {
    const now = '2026-02-19T00:00:00.000Z';
    const tasks = [
      makeTask({ id: 'overdue', dueDate: '2026-02-18T23:59:59.999Z' }),
      makeTask({ id: 'exactly-24h', dueDate: '2026-02-20T00:00:00.000Z' }),
      makeTask({ id: 'between-24h-72h', dueDate: '2026-02-21T00:00:00.000Z' }),
      makeTask({ id: 'over-72h', dueDate: '2026-02-22T01:00:00.000Z' })
    ];

    const queue = buildNowQueue(tasks, {
      availableTimeMin: 30,
      currentEnergy: TASK_ENERGY.MEDIUM,
      now,
      limit: 10
    });

    const byId = Object.fromEntries(queue.items.map((item) => [item.task.id, item]));

    expect(byId['exactly-24h'].score).toBe(7);
    expect(byId['between-24h-72h'].score).toBe(6);
    expect(byId['over-72h'].score).toBe(5);
    expect(byId.overdue.score).toBe(5);

    expect(byId['exactly-24h'].reasons).toEqual(expect.arrayContaining(['due within 24h']));
    expect(byId['between-24h-72h'].reasons).toEqual(expect.arrayContaining(['due within 3 days']));
    expect(byId['over-72h'].reasons).not.toContain('due within 24h');
    expect(byId['over-72h'].reasons).not.toContain('due within 3 days');
    expect(byId.overdue.reasons).not.toContain('due within 24h');
    expect(byId.overdue.reasons).not.toContain('due within 3 days');
  });

  it('uses fallback block for non-matching context when context filter is set', () => {
    const tasks = [
      makeTask({ id: 'admin-task', context: 'admin' }),
      makeTask({ id: 'deep-work-task', context: 'deep-work' })
    ];

    const queue = buildNowQueue(tasks, {
      availableTimeMin: 30,
      currentEnergy: TASK_ENERGY.MEDIUM,
      contextFilter: 'calls'
    });

    expect(queue.items).toHaveLength(0);
    expect(queue.fallbackItems.map(({ task }) => task.id)).toEqual(['admin-task', 'deep-work-task']);
  });
});
