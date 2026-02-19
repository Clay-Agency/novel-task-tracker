import { describe, expect, it } from 'vitest';
import {
  USAGE_EVENT_TYPES,
  USAGE_LOG_STORAGE_KEY,
  USAGE_LOG_STORAGE_VERSION,
  appendUsageLogAction,
  exportUsageLogJson,
  initialUsageLogState,
  loadUsageLogStateResult,
  persistUsageLogState,
  setUsageLogEnabledAction,
  usageLogReducer
} from './usageLog';

describe('usage log state', () => {
  const mockStorage = () => {
    const storage = new Map<string, string>();
    return {
      getItem(key: string): string | null {
        return storage.has(key) ? storage.get(key)! : null;
      },
      setItem(key: string, value: string): void {
        storage.set(key, value);
      }
    };
  };

  it('defaults to disabled and does not append events while disabled', () => {
    const appended = usageLogReducer(
      initialUsageLogState,
      appendUsageLogAction({ eventType: USAGE_EVENT_TYPES.TASK_CREATED, id: 'event-1', timestamp: '2026-02-19T00:00:00.000Z' })
    );

    expect(appended).toEqual(initialUsageLogState);
  });

  it('appends entries once enabled and persists versioned payload', () => {
    const enabledState = usageLogReducer(initialUsageLogState, setUsageLogEnabledAction(true));
    const appendedState = usageLogReducer(
      enabledState,
      appendUsageLogAction({
        eventType: USAGE_EVENT_TYPES.TASK_CREATED,
        details: { taskId: 't1' },
        id: 'event-1',
        timestamp: '2026-02-19T00:00:00.000Z'
      })
    );

    expect(appendedState.entries).toHaveLength(1);
    expect(appendedState.entries[0]).toMatchObject({
      eventType: USAGE_EVENT_TYPES.TASK_CREATED,
      details: { taskId: 't1' }
    });

    const storage = mockStorage();
    persistUsageLogState(appendedState, storage);

    expect(JSON.parse(storage.getItem(USAGE_LOG_STORAGE_KEY) ?? '{}')).toEqual({
      version: USAGE_LOG_STORAGE_VERSION,
      payload: appendedState
    });
  });

  it('loads persisted state and skips persist on future versions', () => {
    const storage = mockStorage();

    storage.setItem(
      USAGE_LOG_STORAGE_KEY,
      JSON.stringify({
        version: USAGE_LOG_STORAGE_VERSION,
        payload: {
          enabled: true,
          entries: [
            {
              id: 'event-1',
              timestamp: '2026-02-19T00:00:00.000Z',
              eventType: USAGE_EVENT_TYPES.TEFQ_USED,
              details: { source: 'energy-change' }
            }
          ]
        }
      })
    );

    expect(loadUsageLogStateResult(storage)).toEqual({
      state: {
        enabled: true,
        entries: [
          {
            id: 'event-1',
            timestamp: '2026-02-19T00:00:00.000Z',
            eventType: USAGE_EVENT_TYPES.TEFQ_USED,
            details: { source: 'energy-change' }
          }
        ]
      },
      skipInitialPersist: false
    });

    storage.setItem(USAGE_LOG_STORAGE_KEY, JSON.stringify({ version: USAGE_LOG_STORAGE_VERSION + 1, payload: {} }));

    expect(loadUsageLogStateResult(storage)).toEqual({
      state: initialUsageLogState,
      skipInitialPersist: true
    });
  });

  it('exports JSON payload', () => {
    const json = exportUsageLogJson({
      enabled: true,
      entries: [
        {
          id: 'event-1',
          timestamp: '2026-02-19T00:00:00.000Z',
          eventType: USAGE_EVENT_TYPES.TASKS_EXPORTED,
          details: { taskCount: 3 }
        }
      ]
    });

    expect(JSON.parse(json)).toEqual({
      version: USAGE_LOG_STORAGE_VERSION,
      payload: {
        enabled: true,
        entries: [
          {
            id: 'event-1',
            timestamp: '2026-02-19T00:00:00.000Z',
            eventType: USAGE_EVENT_TYPES.TASKS_EXPORTED,
            details: { taskCount: 3 }
          }
        ]
      }
    });
  });
});
