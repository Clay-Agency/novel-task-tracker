import { TASK_ENERGY, TASK_PRIORITY, TASK_STATUS, createTask } from '../domain/task';
import {
  TASKS_STORAGE_KEY,
  TASKS_STORAGE_VERSION,
  completeTaskAction,
  createTaskAction,
  createTasksStore,
  deleteTaskAction,
  editTaskAction,
  initialTasksState,
  loadTasksState,
  loadTasksStateResult,
  persistTasksState,
  reopenTaskAction,
  tasksReducer
} from './tasks';

describe('task schema', () => {
  it('creates a task with required and optional fields', () => {
    const task = createTask({
      id: 't1',
      title: '  Draft chapter 1  ',
      description: 'optional details',
      dueDate: '2026-02-20',
      priority: TASK_PRIORITY.HIGH,
      estimatedDurationMin: 30,
      energy: TASK_ENERGY.HIGH,
      context: 'deep-work',
      now: '2026-02-19T00:00:00.000Z'
    });

    expect(task).toEqual({
      id: 't1',
      title: 'Draft chapter 1',
      status: TASK_STATUS.OPEN,
      createdAt: '2026-02-19T00:00:00.000Z',
      updatedAt: '2026-02-19T00:00:00.000Z',
      description: 'optional details',
      completedAt: null,
      dueDate: '2026-02-20',
      priority: TASK_PRIORITY.HIGH,
      estimatedDurationMin: 30,
      energy: TASK_ENERGY.HIGH,
      context: 'deep-work'
    });
  });

  it('guards empty title create', () => {
    expect(() => createTask({ title: '   ' })).toThrow(/title is required/i);
  });
});

describe('task actions and reducer', () => {
  it('runs create/edit/complete/reopen/delete flow', () => {
    const createdState = tasksReducer(
      initialTasksState,
      createTaskAction({
        id: 't1',
        title: 'Write outline',
        estimatedDurationMin: 60,
        energy: TASK_ENERGY.MEDIUM,
        now: '2026-02-19T01:00:00.000Z'
      })
    );

    expect(createdState.tasks).toHaveLength(1);
    expect(createdState.tasks[0]).toMatchObject({
      id: 't1',
      title: 'Write outline',
      status: TASK_STATUS.OPEN,
      estimatedDurationMin: 60,
      energy: TASK_ENERGY.MEDIUM
    });

    const editedState = tasksReducer(
      createdState,
      editTaskAction({
        id: 't1',
        title: 'Write full outline',
        description: 'Draft all beats',
        dueDate: '2026-02-21',
        priority: TASK_PRIORITY.HIGH,
        estimatedDurationMin: 30,
        energy: TASK_ENERGY.HIGH,
        context: 'deep-work',
        now: '2026-02-19T01:05:00.000Z'
      })
    );
    expect(editedState.tasks[0]).toMatchObject({
      title: 'Write full outline',
      description: 'Draft all beats',
      dueDate: '2026-02-21',
      priority: TASK_PRIORITY.HIGH,
      estimatedDurationMin: 30,
      energy: TASK_ENERGY.HIGH,
      context: 'deep-work',
      updatedAt: '2026-02-19T01:05:00.000Z'
    });

    const completedState = tasksReducer(
      editedState,
      completeTaskAction({ id: 't1', now: '2026-02-19T01:10:00.000Z' })
    );
    expect(completedState.tasks[0]).toMatchObject({
      status: TASK_STATUS.COMPLETED,
      completedAt: '2026-02-19T01:10:00.000Z'
    });

    const reopenedState = tasksReducer(
      completedState,
      reopenTaskAction({ id: 't1', now: '2026-02-19T01:15:00.000Z' })
    );
    expect(reopenedState.tasks[0]).toMatchObject({
      status: TASK_STATUS.OPEN,
      completedAt: null,
      updatedAt: '2026-02-19T01:15:00.000Z'
    });

    const deletedState = tasksReducer(reopenedState, deleteTaskAction({ id: 't1' }));
    expect(deletedState.tasks).toEqual([]);
  });

  it('keeps completed/open transitions idempotent', () => {
    const createdState = tasksReducer(
      initialTasksState,
      createTaskAction({ id: 't1', title: 'Ship MVP', now: '2026-02-19T01:00:00.000Z' })
    );

    const completedState = tasksReducer(
      createdState,
      completeTaskAction({ id: 't1', now: '2026-02-19T01:10:00.000Z' })
    );

    const completedAgainState = tasksReducer(
      completedState,
      completeTaskAction({ id: 't1', now: '2026-02-19T01:30:00.000Z' })
    );

    expect(completedAgainState.tasks[0]).toMatchObject({
      status: TASK_STATUS.COMPLETED,
      completedAt: '2026-02-19T01:10:00.000Z',
      updatedAt: '2026-02-19T01:10:00.000Z'
    });

    const reopenedState = tasksReducer(
      completedAgainState,
      reopenTaskAction({ id: 't1', now: '2026-02-19T01:45:00.000Z' })
    );

    const reopenedAgainState = tasksReducer(
      reopenedState,
      reopenTaskAction({ id: 't1', now: '2026-02-19T02:00:00.000Z' })
    );

    expect(reopenedAgainState.tasks[0]).toMatchObject({
      status: TASK_STATUS.OPEN,
      completedAt: null,
      updatedAt: '2026-02-19T01:45:00.000Z'
    });
  });

  it('returns previous state for unknown action type', () => {
    const result = tasksReducer(initialTasksState, { type: 'unknown/action' });
    expect(result).toBe(initialTasksState);
  });

  it('guards invalid edit with empty title', () => {
    expect(() => editTaskAction({ id: 't1', title: '   ' })).toThrow(/title is required/i);
  });

  it('requires task id for id-based actions', () => {
    expect(() => editTaskAction({ title: 'x' })).toThrow(/id is required/i);
    expect(() => completeTaskAction({})).toThrow(/id is required/i);
    expect(() => reopenTaskAction({})).toThrow(/id is required/i);
    expect(() => deleteTaskAction({})).toThrow(/id is required/i);
  });
});

describe('task persistence', () => {
  const mockStorage = () => {
    const storage = new Map();
    return {
      getItem(key) {
        return storage.has(key) ? storage.get(key) : null;
      },
      setItem(key, value) {
        storage.set(key, value);
      }
    };
  };

  it('persists state with versioned payload', () => {
    const storage = mockStorage();
    const state = {
      tasks: [
        {
          id: 't1',
          title: 'Persist me',
          status: TASK_STATUS.OPEN,
          createdAt: '2026-02-19T00:00:00.000Z',
          updatedAt: '2026-02-19T00:00:00.000Z',
          description: null,
          completedAt: null,
          dueDate: null,
          priority: TASK_PRIORITY.NORMAL,
          estimatedDurationMin: null,
          energy: null,
          context: null
        }
      ]
    };

    persistTasksState(state, storage);

    expect(JSON.parse(storage.getItem(TASKS_STORAGE_KEY))).toEqual({
      version: TASKS_STORAGE_VERSION,
      payload: state
    });
  });

  it('loads and migrates legacy v0 persisted tasks shape', () => {
    const storage = mockStorage();
    storage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify({
        tasks: [
          {
            id: 'legacy-1',
            title: '  Legacy task  ',
            status: 'completed',
            createdAt: '2026-02-18T00:00:00.000Z',
            updatedAt: '2026-02-18T01:00:00.000Z',
            description: 'legacy notes',
            completedAt: '2026-02-18T01:00:00.000Z'
          },
          {
            id: 'legacy-2',
            title: '   '
          }
        ]
      })
    );

    expect(loadTasksState(storage)).toEqual({
      tasks: [
        {
          id: 'legacy-1',
          title: 'Legacy task',
          status: TASK_STATUS.COMPLETED,
          createdAt: '2026-02-18T00:00:00.000Z',
          updatedAt: '2026-02-18T01:00:00.000Z',
          description: 'legacy notes',
          completedAt: '2026-02-18T01:00:00.000Z',
          dueDate: null,
          priority: TASK_PRIORITY.NORMAL,
          estimatedDurationMin: null,
          energy: null,
          context: null
        }
      ]
    });
  });

  it('loads current version payload and normalizes invalid records', () => {
    const storage = mockStorage();

    storage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify({
        version: TASKS_STORAGE_VERSION,
        payload: {
          tasks: [
            {
              id: 't1',
              title: '  Current task  ',
              status: 'open',
              createdAt: '2026-02-19T00:00:00.000Z',
              updatedAt: '2026-02-19T00:10:00.000Z',
              description: null,
              completedAt: null,
              dueDate: '2026-02-20',
              priority: 'high',
              estimatedDurationMin: 15,
              energy: 'low',
              context: 'calls'
            },
            {
              id: 'missing-dates',
              title: 'Invalid task'
            }
          ]
        }
      })
    );

    expect(loadTasksState(storage)).toEqual({
      tasks: [
        {
          id: 't1',
          title: 'Current task',
          status: TASK_STATUS.OPEN,
          createdAt: '2026-02-19T00:00:00.000Z',
          updatedAt: '2026-02-19T00:10:00.000Z',
          description: null,
          completedAt: null,
          dueDate: '2026-02-20',
          priority: TASK_PRIORITY.HIGH,
          estimatedDurationMin: 15,
          energy: TASK_ENERGY.LOW,
          context: 'calls'
        }
      ]
    });
  });

  it('flags future versions to skip initial persist and falls back for invalid JSON', () => {
    const storage = mockStorage();

    storage.setItem(TASKS_STORAGE_KEY, JSON.stringify({ version: TASKS_STORAGE_VERSION + 1, payload: { tasks: [] } }));
    expect(loadTasksStateResult(storage)).toEqual({
      state: initialTasksState,
      skipInitialPersist: true
    });

    storage.setItem(TASKS_STORAGE_KEY, '{not-json');
    expect(loadTasksState(storage)).toEqual(initialTasksState);
  });

  it('handles localStorage getter access errors without throwing', () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('denied');
      }
    });

    expect(loadTasksState()).toEqual(initialTasksState);
    expect(() => persistTasksState({ tasks: [] })).not.toThrow();

    if (originalDescriptor) {
      Object.defineProperty(globalThis, 'localStorage', originalDescriptor);
    } else {
      delete globalThis.localStorage;
    }
  });
});

describe('task store', () => {
  it('dispatches actions and mutates state through reducer', () => {
    const store = createTasksStore();

    store.dispatch(createTaskAction({ id: 't1', title: 'Ship MVP', now: '2026-02-19T02:00:00.000Z' }));
    store.dispatch(completeTaskAction({ id: 't1', now: '2026-02-19T02:30:00.000Z' }));

    expect(store.getState().tasks).toHaveLength(1);
    expect(store.getState().tasks[0]).toMatchObject({
      id: 't1',
      title: 'Ship MVP',
      status: TASK_STATUS.COMPLETED,
      completedAt: '2026-02-19T02:30:00.000Z'
    });
  });
});
