export const TASK_STATUS = {
  OPEN: 'open',
  COMPLETED: 'completed'
} as const;

export const TASK_PRIORITY = {
  NORMAL: 'normal',
  HIGH: 'high'
} as const;

export const TASK_ENERGY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export const TASK_CONTEXT = {
  DEEP_WORK: 'deep-work',
  ADMIN: 'admin',
  ERRANDS: 'errands',
  CALLS: 'calls'
} as const;

export const DURATION_PRESETS_MINUTES = [5, 15, 30, 60, 90] as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];
export type TaskEnergy = (typeof TASK_ENERGY)[keyof typeof TASK_ENERGY];
export type TaskContext = (typeof TASK_CONTEXT)[keyof typeof TASK_CONTEXT];

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  description: string | null;
  completedAt: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  estimatedDurationMin: number | null;
  energy: TaskEnergy | null;
  context: TaskContext | null;
}

export interface CreateTaskInput {
  id?: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: TaskPriority;
  estimatedDurationMin?: number | string | null;
  energy?: TaskEnergy | null;
  context?: TaskContext | null;
  now?: string;
}

const VALID_PRIORITIES = new Set<TaskPriority>(Object.values(TASK_PRIORITY));
const VALID_ENERGIES = new Set<TaskEnergy>(Object.values(TASK_ENERGY));
const VALID_CONTEXTS = new Set<TaskContext>(Object.values(TASK_CONTEXT));

export function normalizeTitle(title: unknown): string {
  if (typeof title !== 'string') {
    return '';
  }

  return title.trim();
}

export function isValidTitle(title: unknown): boolean {
  return normalizeTitle(title).length > 0;
}

export function assertValidTitle(title: unknown): asserts title is string {
  if (!isValidTitle(title)) {
    throw new Error('Task title is required');
  }
}

export function normalizeDescription(description: unknown): string | null {
  if (description === undefined || description === null) {
    return null;
  }

  if (typeof description !== 'string') {
    return null;
  }

  const trimmed = description.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeDueDate(dueDate: unknown): string | null {
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

export function normalizePriority(priority: unknown): TaskPriority {
  return VALID_PRIORITIES.has(priority as TaskPriority) ? (priority as TaskPriority) : TASK_PRIORITY.NORMAL;
}

export function normalizeEstimatedDurationMin(estimatedDurationMin: unknown): number | null {
  if (estimatedDurationMin === undefined || estimatedDurationMin === null || estimatedDurationMin === '') {
    return null;
  }

  const parsed = Number(estimatedDurationMin);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed > 0 ? Math.round(parsed) : null;
}

export function normalizeEnergy(energy: unknown): TaskEnergy | null {
  return VALID_ENERGIES.has(energy as TaskEnergy) ? (energy as TaskEnergy) : null;
}

export function normalizeContext(context: unknown): TaskContext | null {
  return VALID_CONTEXTS.has(context as TaskContext) ? (context as TaskContext) : null;
}

function fallbackUuid(): string {
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
}: CreateTaskInput): Task {
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
