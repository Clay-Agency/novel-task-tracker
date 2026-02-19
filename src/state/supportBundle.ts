import { TASKS_STORAGE_VERSION, type TasksState } from './tasks';
import { USAGE_LOG_STORAGE_VERSION, type UsageLogState } from './usageLog';

export const SUPPORT_BUNDLE_VERSION = 1;

export interface SupportBundleDiagnostics {
  appVersion: string;
  appCommitSha: string;
}

export interface SupportBundle {
  version: number;
  exportedAt: string;
  diagnostics: SupportBundleDiagnostics;
  privacy: {
    containsTaskData: true;
    includesUsageLog: boolean;
  };
  payload: {
    tasks: {
      version: number;
      payload: TasksState;
    };
    usageLog: {
      version: number;
      payload: UsageLogState;
    } | null;
  };
}

export function createSupportBundle({
  tasksState,
  usageLogState,
  diagnostics,
  exportedAt = new Date().toISOString()
}: {
  tasksState: TasksState;
  usageLogState: UsageLogState;
  diagnostics: SupportBundleDiagnostics;
  exportedAt?: string;
}): SupportBundle {
  const normalizedTasks: TasksState = {
    tasks: Array.isArray(tasksState?.tasks) ? tasksState.tasks : []
  };

  const normalizedUsageLog: UsageLogState = {
    enabled: Boolean(usageLogState?.enabled),
    entries: Array.isArray(usageLogState?.entries) ? usageLogState.entries : []
  };

  return {
    version: SUPPORT_BUNDLE_VERSION,
    exportedAt,
    diagnostics,
    privacy: {
      containsTaskData: true,
      includesUsageLog: normalizedUsageLog.enabled
    },
    payload: {
      tasks: {
        version: TASKS_STORAGE_VERSION,
        payload: normalizedTasks
      },
      usageLog: normalizedUsageLog.enabled
        ? {
            version: USAGE_LOG_STORAGE_VERSION,
            payload: normalizedUsageLog
          }
        : null
    }
  };
}

export function exportSupportBundleJson(input: {
  tasksState: TasksState;
  usageLogState: UsageLogState;
  diagnostics: SupportBundleDiagnostics;
  exportedAt?: string;
}): string {
  return JSON.stringify(createSupportBundle(input), null, 2);
}
