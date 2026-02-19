export const USAGE_LOG_STORAGE_KEY = 'novel-task-tracker/usage-log';
export const USAGE_LOG_STORAGE_VERSION = 1;
export const USAGE_LOG_MAX_ENTRIES = 300;

export const USAGE_LOG_ACTIONS = {
  SET_ENABLED: 'usageLog/setEnabled',
  APPEND: 'usageLog/append',
  RESET: 'usageLog/reset'
} as const;

export const USAGE_EVENT_TYPES = {
  TASK_CREATED: 'task.created',
  TASK_EDITED: 'task.edited',
  TASK_COMPLETED: 'task.completed',
  TASK_REOPENED: 'task.reopened',
  TASK_DELETED: 'task.deleted',
  TEFQ_USED: 'tefq.used',
  TASKS_EXPORTED: 'tasks.exported',
  TASKS_IMPORTED: 'tasks.imported',
  APP_RESET: 'app.reset'
} as const;

export type UsageEventType = (typeof USAGE_EVENT_TYPES)[keyof typeof USAGE_EVENT_TYPES];

export interface UsageLogEntry {
  id: string;
  timestamp: string;
  eventType: UsageEventType;
  details: Record<string, unknown> | null;
}

export interface UsageLogState {
  enabled: boolean;
  entries: UsageLogEntry[];
}

export interface LoadUsageLogStateResult {
  state: UsageLogState;
  skipInitialPersist: boolean;
}

export const initialUsageLogState: UsageLogState = {
  enabled: false,
  entries: []
};

const defaultLoadResult: LoadUsageLogStateResult = {
  state: initialUsageLogState,
  skipInitialPersist: false
};

type SetEnabledAction = {
  type: (typeof USAGE_LOG_ACTIONS)['SET_ENABLED'];
  payload: { enabled: boolean };
};

type AppendAction = {
  type: (typeof USAGE_LOG_ACTIONS)['APPEND'];
  payload: UsageLogEntry;
};

type ResetAction = {
  type: (typeof USAGE_LOG_ACTIONS)['RESET'];
};

type UsageLogAction = SetEnabledAction | AppendAction | ResetAction;

type AnyUsageLogAction = UsageLogAction | { type: string };

export function setUsageLogEnabledAction(enabled: boolean): SetEnabledAction {
  return {
    type: USAGE_LOG_ACTIONS.SET_ENABLED,
    payload: { enabled: Boolean(enabled) }
  };
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function appendUsageLogAction({
  eventType,
  details = null,
  timestamp = new Date().toISOString(),
  id = randomId()
}: {
  eventType: UsageEventType;
  details?: Record<string, unknown> | null;
  timestamp?: string;
  id?: string;
}): AppendAction {
  return {
    type: USAGE_LOG_ACTIONS.APPEND,
    payload: {
      id,
      timestamp,
      eventType,
      details
    }
  };
}

export function resetUsageLogAction(): ResetAction {
  return {
    type: USAGE_LOG_ACTIONS.RESET
  };
}

export function usageLogReducer(state: UsageLogState = initialUsageLogState, action: AnyUsageLogAction): UsageLogState {
  switch (action.type) {
    case USAGE_LOG_ACTIONS.SET_ENABLED:
      return {
        ...state,
        enabled: (action as SetEnabledAction).payload.enabled
      };

    case USAGE_LOG_ACTIONS.APPEND: {
      if (!state.enabled) {
        return state;
      }

      const nextEntries = [...state.entries, (action as AppendAction).payload];
      return {
        ...state,
        entries: nextEntries.slice(-USAGE_LOG_MAX_ENTRIES)
      };
    }

    case USAGE_LOG_ACTIONS.RESET:
      return initialUsageLogState;

    default:
      return state;
  }
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?: (key: string) => void;
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

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isUsageEventType(value: unknown): value is UsageEventType {
  return typeof value === 'string' && Object.values(USAGE_EVENT_TYPES).includes(value as UsageEventType);
}

function normalizeEntry(rawEntry: unknown): UsageLogEntry | null {
  if (!isObject(rawEntry)) {
    return null;
  }

  const id = typeof rawEntry.id === 'string' ? rawEntry.id : null;
  const timestamp = typeof rawEntry.timestamp === 'string' ? rawEntry.timestamp : null;
  const eventType = rawEntry.eventType;

  if (!id || !timestamp || !isUsageEventType(eventType)) {
    return null;
  }

  return {
    id,
    timestamp,
    eventType,
    details: isObject(rawEntry.details) ? rawEntry.details : null
  };
}

function migratePersistedUsageLogState(rawPersistedState: unknown): LoadUsageLogStateResult {
  if (!isObject(rawPersistedState)) {
    return defaultLoadResult;
  }

  const version = typeof rawPersistedState.version === 'number' ? rawPersistedState.version : 0;

  if (version > USAGE_LOG_STORAGE_VERSION) {
    return {
      state: initialUsageLogState,
      skipInitialPersist: true
    };
  }

  const payload = isObject(rawPersistedState.payload) ? rawPersistedState.payload : rawPersistedState;
  const enabled = Boolean(payload.enabled);
  const entries = Array.isArray(payload.entries) ? payload.entries.map(normalizeEntry).filter((entry): entry is UsageLogEntry => entry !== null) : [];

  return {
    state: {
      enabled,
      entries: entries.slice(-USAGE_LOG_MAX_ENTRIES)
    },
    skipInitialPersist: false
  };
}

export function loadUsageLogStateResult(storage?: StorageLike | null): LoadUsageLogStateResult {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage || typeof resolvedStorage.getItem !== 'function') {
    return defaultLoadResult;
  }

  try {
    const raw = resolvedStorage.getItem(USAGE_LOG_STORAGE_KEY);
    if (!raw) {
      return defaultLoadResult;
    }

    return migratePersistedUsageLogState(JSON.parse(raw));
  } catch {
    return defaultLoadResult;
  }
}

export function persistUsageLogState(state: UsageLogState, storage?: StorageLike | null): void {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage || typeof resolvedStorage.setItem !== 'function') {
    return;
  }

  const normalizedState: UsageLogState = {
    enabled: Boolean(state?.enabled),
    entries: Array.isArray(state?.entries) ? state.entries.slice(-USAGE_LOG_MAX_ENTRIES) : []
  };

  try {
    resolvedStorage.setItem(
      USAGE_LOG_STORAGE_KEY,
      JSON.stringify({
        version: USAGE_LOG_STORAGE_VERSION,
        payload: normalizedState
      })
    );
  } catch {
    // localStorage quota/security failures should not crash the app
  }
}

export function clearPersistedUsageLogState(storage?: StorageLike | null): void {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage || typeof resolvedStorage.removeItem !== 'function') {
    return;
  }

  try {
    resolvedStorage.removeItem(USAGE_LOG_STORAGE_KEY);
  } catch {
    // localStorage quota/security failures should not crash the app
  }
}

export function exportUsageLogJson(state: UsageLogState): string {
  const normalizedState: UsageLogState = {
    enabled: Boolean(state?.enabled),
    entries: Array.isArray(state?.entries) ? state.entries.slice(-USAGE_LOG_MAX_ENTRIES) : []
  };

  return JSON.stringify(
    {
      version: USAGE_LOG_STORAGE_VERSION,
      payload: normalizedState
    },
    null,
    2
  );
}
