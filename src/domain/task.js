export const TASK_STATUS = {
  OPEN: 'open',
  COMPLETED: 'completed'
};

/**
 * Task schema:
 * - id: string (required)
 * - title: string (required, non-empty after trim)
 * - status: 'open' | 'completed' (required)
 * - createdAt: ISO timestamp string (required)
 * - updatedAt: ISO timestamp string (required)
 * - description: string | null (optional)
 * - completedAt: ISO timestamp string | null (optional)
 */

export function normalizeTitle(title) {
  if (typeof title !== 'string') {
    return '';
  }

  return title.trim();
}

export function isValidTitle(title) {
  return normalizeTitle(title).length > 0;
}

export function assertValidTitle(title) {
  if (!isValidTitle(title)) {
    throw new Error('Task title is required');
  }
}

function fallbackUuid() {
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createTask({ id, title, description = null, now = new Date().toISOString() }) {
  assertValidTitle(title);

  return {
    id: id ?? (globalThis.crypto?.randomUUID?.() ?? fallbackUuid()),
    title: normalizeTitle(title),
    status: TASK_STATUS.OPEN,
    createdAt: now,
    updatedAt: now,
    description,
    completedAt: null
  };
}
