export const TASK_STATUS = {
  OPEN: 'open',
  COMPLETED: 'completed'
};

export const TASK_PRIORITY = {
  NORMAL: 'normal',
  HIGH: 'high'
};

export const TASK_ENERGY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const TASK_CONTEXT = {
  DEEP_WORK: 'deep-work',
  ADMIN: 'admin',
  ERRANDS: 'errands',
  CALLS: 'calls'
};

export const DURATION_PRESETS_MINUTES = [5, 15, 30, 60, 90];

/**
 * Task schema:
 * - id: string (required)
 * - title: string (required, non-empty after trim)
 * - status: 'open' | 'completed' (required)
 * - createdAt: ISO timestamp string (required)
 * - updatedAt: ISO timestamp string (required)
 * - description: string | null (optional)
 * - completedAt: ISO timestamp string | null (optional)
 * - dueDate: YYYY-MM-DD | null (optional)
 * - priority: 'normal' | 'high' (optional, defaults normal)
 * - estimatedDurationMin: number | null (optional)
 * - energy: 'low' | 'medium' | 'high' | null (optional)
 * - context: 'deep-work' | 'admin' | 'errands' | 'calls' | null (optional)
 */

const VALID_PRIORITIES = new Set(Object.values(TASK_PRIORITY));
const VALID_ENERGIES = new Set(Object.values(TASK_ENERGY));
const VALID_CONTEXTS = new Set(Object.values(TASK_CONTEXT));

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

export function normalizeDescription(description) {
  if (description === undefined || description === null) {
    return null;
  }

  if (typeof description !== 'string') {
    return null;
  }

  const trimmed = description.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeDueDate(dueDate) {
  if (dueDate === undefined || dueDate === null) {
    return null;
  }

  if (typeof dueDate !== 'string') {
    return null;
  }

  const trimmed = dueDate.trim();

  if (!trimmed) {
    return null;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

export function normalizePriority(priority) {
  return VALID_PRIORITIES.has(priority) ? priority : TASK_PRIORITY.NORMAL;
}

export function normalizeEstimatedDurationMin(estimatedDurationMin) {
  if (estimatedDurationMin === undefined || estimatedDurationMin === null || estimatedDurationMin === '') {
    return null;
  }

  const parsed = Number(estimatedDurationMin);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed > 0 ? Math.round(parsed) : null;
}

export function normalizeEnergy(energy) {
  return VALID_ENERGIES.has(energy) ? energy : null;
}

export function normalizeContext(context) {
  return VALID_CONTEXTS.has(context) ? context : null;
}

function fallbackUuid() {
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createTask({
  id,
  title,
  description = null,
  dueDate = null,
  priority = TASK_PRIORITY.NORMAL,
  estimatedDurationMin = null,
  energy = null,
  context = null,
  now = new Date().toISOString()
}) {
  assertValidTitle(title);

  return {
    id: id ?? (globalThis.crypto?.randomUUID?.() ?? fallbackUuid()),
    title: normalizeTitle(title),
    status: TASK_STATUS.OPEN,
    createdAt: now,
    updatedAt: now,
    description: normalizeDescription(description),
    completedAt: null,
    dueDate: normalizeDueDate(dueDate),
    priority: normalizePriority(priority),
    estimatedDurationMin: normalizeEstimatedDurationMin(estimatedDurationMin),
    energy: normalizeEnergy(energy),
    context: normalizeContext(context)
  };
}
