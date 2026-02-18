import {
  TASK_ENERGY,
  TASK_PRIORITY,
  TASK_STATUS,
  assertValidTitle,
  createTask,
  normalizeContext,
  normalizeDueDate,
  normalizeEnergy,
  normalizeEstimatedDurationMin,
  normalizePriority,
  normalizeTitle
} from '../domain/task';

export const TASK_ACTIONS = {
  CREATE: 'tasks/create',
  EDIT: 'tasks/edit',
  COMPLETE: 'tasks/complete',
  REOPEN: 'tasks/reopen',
  DELETE: 'tasks/delete'
};

export const TASKS_STORAGE_KEY = 'novel-task-tracker/tasks';
export const TASKS_STORAGE_VERSION = 2;

export const initialTasksState = {
  tasks: []
};

const defaultLoadResult = {
  state: initialTasksState,
  skipInitialPersist: false
};

export function createTaskAction({
  title,
  description = null,
  dueDate = null,
  priority = TASK_PRIORITY.NORMAL,
  estimatedDurationMin = null,
  energy = null,
  context = null,
  now,
  id
} = {}) {
  return {
    type: TASK_ACTIONS.CREATE,
    payload: createTask({ title, description, dueDate, priority, estimatedDurationMin, energy, context, now, id })
  };
}

export function editTaskAction({
  id,
  title,
  description,
  dueDate,
  priority,
  estimatedDurationMin,
  energy,
  context,
  now = new Date().toISOString()
} = {}) {
  if (!id) {
    throw new Error('Task id is required');
  }

  if (title !== undefined) {
    assertValidTitle(title);
  }

  return {
    type: TASK_ACTIONS.EDIT,
    payload: {
      id,
      now,
      title: title === undefined ? undefined : normalizeTitle(title),
      description: description === undefined ? undefined : description,
      dueDate: dueDate === undefined ? undefined : dueDate,
      priority,
      estimatedDurationMin,
      energy,
      context
    }
  };
}

export function completeTaskAction({ id, now = new Date().toISOString() } = {}) {
  if (!id) {
    throw new Error('Task id is required');
  }

  return {
    type: TASK_ACTIONS.COMPLETE,
    payload: { id, now }
  };
}

export function reopenTaskAction({ id, now = new Date().toISOString() } = {}) {
  if (!id) {
    throw new Error('Task id is required');
  }

  return {
    type: TASK_ACTIONS.REOPEN,
    payload: { id, now }
  };
}

export function deleteTaskAction({ id } = {}) {
  if (!id) {
    throw new Error('Task id is required');
  }

  return {
    type: TASK_ACTIONS.DELETE,
    payload: { id }
  };
}

function mapTaskById(tasks, id, updater) {
  return tasks.map((task) => (task.id === id ? updater(task) : task));
}

export function tasksReducer(state = initialTasksState, action = {}) {
  switch (action.type) {
    case TASK_ACTIONS.CREATE:
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      };

    case TASK_ACTIONS.EDIT: {
      const { id, now, title, description, dueDate, priority, estimatedDurationMin, energy, context } = action.payload;
      return {
        ...state,
        tasks: mapTaskById(state.tasks, id, (task) => ({
          ...task,
          title: title === undefined ? task.title : title,
          description: description === undefined ? task.description : normalizeDescription(description),
          dueDate: dueDate === undefined ? task.dueDate : normalizeDueDate(dueDate),
          priority: priority === undefined ? task.priority : normalizePriority(priority),
          estimatedDurationMin:
            estimatedDurationMin === undefined
              ? task.estimatedDurationMin
              : normalizeEstimatedDurationMin(estimatedDurationMin),
          energy: energy === undefined ? task.energy : normalizeEnergy(energy),
          context: context === undefined ? task.context : normalizeContext(context),
          updatedAt: now
        }))
      };
    }

    case TASK_ACTIONS.COMPLETE: {
      const { id, now } = action.payload;
      return {
        ...state,
        tasks: mapTaskById(state.tasks, id, (task) => {
          if (task.status === TASK_STATUS.COMPLETED) {
            return task;
          }

          return {
            ...task,
            status: TASK_STATUS.COMPLETED,
            completedAt: now,
            updatedAt: now
          };
        })
      };
    }

    case TASK_ACTIONS.REOPEN: {
      const { id, now } = action.payload;
      return {
        ...state,
        tasks: mapTaskById(state.tasks, id, (task) => {
          if (task.status === TASK_STATUS.OPEN) {
            return task;
          }

          return {
            ...task,
            status: TASK_STATUS.OPEN,
            completedAt: null,
            updatedAt: now
          };
        })
      };
    }

    case TASK_ACTIONS.DELETE: {
      const { id } = action.payload;
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== id)
      };
    }

    default:
      return state;
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeDescription(description) {
  if (typeof description !== 'string') {
    return null;
  }

  const trimmed = description.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeStoredTask(rawTask) {
  if (!isObject(rawTask)) {
    return null;
  }

  const normalizedTitle = normalizeTitle(rawTask.title);
  if (!normalizedTitle) {
    return null;
  }

  const id = typeof rawTask.id === 'string' ? rawTask.id : null;
  const createdAt = typeof rawTask.createdAt === 'string' ? rawTask.createdAt : null;
  const updatedAt = typeof rawTask.updatedAt === 'string' ? rawTask.updatedAt : createdAt;

  if (!id || !createdAt || !updatedAt) {
    return null;
  }

  const status = rawTask.status === TASK_STATUS.COMPLETED ? TASK_STATUS.COMPLETED : TASK_STATUS.OPEN;

  const completedAt =
    status === TASK_STATUS.COMPLETED && typeof rawTask.completedAt === 'string' ? rawTask.completedAt : null;

  return {
    id,
    title: normalizedTitle,
    status,
    createdAt,
    updatedAt,
    description: normalizeDescription(rawTask.description),
    completedAt,
    dueDate: normalizeDueDate(rawTask.dueDate),
    priority: normalizePriority(rawTask.priority),
    estimatedDurationMin: normalizeEstimatedDurationMin(rawTask.estimatedDurationMin),
    energy: normalizeEnergy(rawTask.energy),
    context: normalizeContext(rawTask.context)
  };
}

function migrateTasksPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (isObject(payload) && Array.isArray(payload.tasks)) {
    return payload.tasks;
  }

  return [];
}

function migratePersistedState(rawPersistedState) {
  if (!rawPersistedState) {
    return defaultLoadResult;
  }

  const version =
    isObject(rawPersistedState) && typeof rawPersistedState.version === 'number'
      ? rawPersistedState.version
      : 0;

  if (version > TASKS_STORAGE_VERSION) {
    return {
      state: initialTasksState,
      skipInitialPersist: true
    };
  }

  const rawTasks =
    version === 0 ? migrateTasksPayload(rawPersistedState) : migrateTasksPayload(rawPersistedState.payload);

  return {
    state: {
      tasks: rawTasks.map(normalizeStoredTask).filter(Boolean)
    },
    skipInitialPersist: false
  };
}

function resolveStorage(storage) {
  if (storage !== undefined) {
    return storage;
  }

  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function loadTasksStateResult(storage) {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage || typeof resolvedStorage.getItem !== 'function') {
    return defaultLoadResult;
  }

  try {
    const raw = resolvedStorage.getItem(TASKS_STORAGE_KEY);

    if (!raw) {
      return defaultLoadResult;
    }

    return migratePersistedState(JSON.parse(raw));
  } catch {
    return defaultLoadResult;
  }
}

export function loadTasksState(storage) {
  return loadTasksStateResult(storage).state;
}

export function persistTasksState(state, storage) {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage || typeof resolvedStorage.setItem !== 'function') {
    return;
  }

  const normalizedState = {
    tasks: Array.isArray(state?.tasks) ? state.tasks : []
  };

  try {
    resolvedStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify({
        version: TASKS_STORAGE_VERSION,
        payload: normalizedState
      })
    );
  } catch {
    // localStorage quota/security failures should not crash the app
  }
}

export function createTasksStore(initialState = initialTasksState) {
  let state = initialState;

  return {
    getState() {
      return state;
    },

    dispatch(action) {
      state = tasksReducer(state, action);
      return action;
    }
  };
}

export { TASK_ENERGY, TASK_PRIORITY };
