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
  normalizeTitle,
  type CreateTaskInput,
  type Task,
  type TaskContext,
  type TaskEnergy,
  type TaskPriority
} from '../domain/task';

export const TASK_ACTIONS = {
  CREATE: 'tasks/create',
  EDIT: 'tasks/edit',
  COMPLETE: 'tasks/complete',
  REOPEN: 'tasks/reopen',
  DELETE: 'tasks/delete',
  IMPORT: 'tasks/import'
} as const;

export const TASKS_STORAGE_KEY = 'novel-task-tracker/tasks';
export const TASKS_STORAGE_VERSION = 2;

export interface TasksState {
  tasks: Task[];
}

export const initialTasksState: TasksState = {
  tasks: []
};

export interface LoadTasksStateResult {
  state: TasksState;
  skipInitialPersist: boolean;
}

const defaultLoadResult: LoadTasksStateResult = {
  state: initialTasksState,
  skipInitialPersist: false
};

type CreateTaskAction = {
  type: (typeof TASK_ACTIONS)['CREATE'];
  payload: Task;
};

type EditTaskPayload = {
  id: string;
  now: string;
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: TaskPriority;
  estimatedDurationMin?: number | string | null;
  energy?: TaskEnergy | null;
  context?: TaskContext | null;
};

type EditTaskAction = {
  type: (typeof TASK_ACTIONS)['EDIT'];
  payload: EditTaskPayload;
};

type IdActionPayload = {
  id: string;
  now: string;
};

type CompleteTaskAction = {
  type: (typeof TASK_ACTIONS)['COMPLETE'];
  payload: IdActionPayload;
};

type ReopenTaskAction = {
  type: (typeof TASK_ACTIONS)['REOPEN'];
  payload: IdActionPayload;
};

type DeleteTaskAction = {
  type: (typeof TASK_ACTIONS)['DELETE'];
  payload: { id: string };
};

type ImportTasksAction = {
  type: (typeof TASK_ACTIONS)['IMPORT'];
  payload: { tasks: Task[] };
};

export type TasksAction =
  | CreateTaskAction
  | EditTaskAction
  | CompleteTaskAction
  | ReopenTaskAction
  | DeleteTaskAction
  | ImportTasksAction;

export type AnyTasksAction = TasksAction | { type: string };

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
}: Partial<CreateTaskInput> = {}): CreateTaskAction {
  return {
    type: TASK_ACTIONS.CREATE,
    payload: createTask({ title: title ?? '', description, dueDate, priority, estimatedDurationMin, energy, context, now, id })
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
}: {
  id?: string;
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: TaskPriority;
  estimatedDurationMin?: number | string | null;
  energy?: TaskEnergy | null;
  context?: TaskContext | null;
  now?: string;
} = {}): EditTaskAction {
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

export function completeTaskAction({ id, now = new Date().toISOString() }: { id?: string; now?: string } = {}): CompleteTaskAction {
  if (!id) {
    throw new Error('Task id is required');
  }

  return {
    type: TASK_ACTIONS.COMPLETE,
    payload: { id, now }
  };
}

export function reopenTaskAction({ id, now = new Date().toISOString() }: { id?: string; now?: string } = {}): ReopenTaskAction {
  if (!id) {
    throw new Error('Task id is required');
  }

  return {
    type: TASK_ACTIONS.REOPEN,
    payload: { id, now }
  };
}

export function deleteTaskAction({ id }: { id?: string } = {}): DeleteTaskAction {
  if (!id) {
    throw new Error('Task id is required');
  }

  return {
    type: TASK_ACTIONS.DELETE,
    payload: { id }
  };
}

export function importTasksAction({ tasks }: { tasks?: Task[] } = {}): ImportTasksAction {
  if (!Array.isArray(tasks)) {
    throw new Error('Import payload must include tasks array');
  }

  return {
    type: TASK_ACTIONS.IMPORT,
    payload: { tasks }
  };
}

function mapTaskById(tasks: Task[], id: string, updater: (task: Task) => Task): Task[] {
  return tasks.map((task) => (task.id === id ? updater(task) : task));
}

export function tasksReducer(state: TasksState = initialTasksState, action: AnyTasksAction): TasksState {
  switch (action.type) {
    case TASK_ACTIONS.CREATE: {
      const createAction = action as CreateTaskAction;
      return {
        ...state,
        tasks: [...state.tasks, createAction.payload]
      };
    }

    case TASK_ACTIONS.EDIT: {
      const { id, now, title, description, dueDate, priority, estimatedDurationMin, energy, context } = (action as EditTaskAction).payload;
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
      const { id, now } = (action as CompleteTaskAction).payload;
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
      const { id, now } = (action as ReopenTaskAction).payload;
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
      const { id } = (action as DeleteTaskAction).payload;
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== id)
      };
    }

    case TASK_ACTIONS.IMPORT: {
      return {
        ...state,
        tasks: (action as ImportTasksAction).payload.tasks
      };
    }

    default:
      return state;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeDescription(description: unknown): string | null {
  if (typeof description !== 'string') {
    return null;
  }

  const trimmed = description.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeStoredTask(rawTask: unknown): Task | null {
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

function migrateTasksPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (isObject(payload) && Array.isArray(payload.tasks)) {
    return payload.tasks;
  }

  return [];
}

function isImportShape(rawValue: unknown): boolean {
  if (Array.isArray(rawValue)) {
    return true;
  }

  if (!isObject(rawValue)) {
    return false;
  }

  if (Array.isArray(rawValue.tasks)) {
    return true;
  }

  if (!('version' in rawValue)) {
    return false;
  }

  return isObject(rawValue.payload) && Array.isArray(rawValue.payload.tasks);
}

function migratePersistedState(rawPersistedState: unknown): LoadTasksStateResult {
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
    version === 0
      ? migrateTasksPayload(rawPersistedState)
      : migrateTasksPayload(isObject(rawPersistedState) ? rawPersistedState.payload : null);

  return {
    state: {
      tasks: rawTasks.map(normalizeStoredTask).filter((task): task is Task => task !== null)
    },
    skipInitialPersist: false
  };
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function resolveStorage(storage?: StorageLike | null): StorageLike | null {
  if (storage !== undefined) {
    return storage;
  }

  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function loadTasksStateResult(storage?: StorageLike | null): LoadTasksStateResult {
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

export function loadTasksState(storage?: StorageLike | null): TasksState {
  return loadTasksStateResult(storage).state;
}

export function persistTasksState(state: TasksState, storage?: StorageLike | null): void {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage || typeof resolvedStorage.setItem !== 'function') {
    return;
  }

  const normalizedState: TasksState = {
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

export function exportTasksJson(state: TasksState): string {
  const normalizedState: TasksState = {
    tasks: Array.isArray(state?.tasks) ? state.tasks : []
  };

  return JSON.stringify(
    {
      version: TASKS_STORAGE_VERSION,
      payload: normalizedState
    },
    null,
    2
  );
}

export function importTasksFromJson(rawJson: string): Task[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('Invalid JSON file');
  }

  if (!isImportShape(parsed)) {
    throw new Error('Unsupported import format. Expected tasks JSON export.');
  }

  return migratePersistedState(parsed).state.tasks;
}

export function createTasksStore(initialState: TasksState = initialTasksState): {
  getState: () => TasksState;
  dispatch: (action: TasksAction) => TasksAction;
} {
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
