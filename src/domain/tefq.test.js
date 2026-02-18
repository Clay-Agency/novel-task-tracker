import { describe, expect, it } from 'vitest';
import { TASK_ENERGY, TASK_PRIORITY, TASK_STATUS } from './task';
import { buildNowQueue } from './tefq';

function makeTask(overrides = {}) {
  return {
    id: 'id' in overrides ? overrides.id : 'task-1',
    title: 'title' in overrides ? overrides.title : 'Task',
    status: 'status' in overrides ? overrides.status : TASK_STATUS.OPEN,
    createdAt: 'createdAt' in overrides ? overrides.createdAt : '2026-02-19T00:00:00.000Z',
    updatedAt: 'updatedAt' in overrides ? overrides.updatedAt : '2026-02-19T00:00:00.000Z',
    description: null,
    completedAt: null,
    dueDate: 'dueDate' in overrides ? overrides.dueDate : null,
    priority: 'priority' in overrides ? overrides.priority : TASK_PRIORITY.NORMAL,
    estimatedDurationMin: 'estimatedDurationMin' in overrides ? overrides.estimatedDurationMin : 30,
    energy: 'energy' in overrides ? overrides.energy : TASK_ENERGY.MEDIUM,
    context: 'context' in overrides ? overrides.context : null
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
