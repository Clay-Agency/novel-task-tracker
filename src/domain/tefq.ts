import { TASK_ENERGY, TASK_PRIORITY, TASK_STATUS, type Task, type TaskEnergy, type TaskContext } from './task';

const ENERGY_ORDER: TaskEnergy[] = [TASK_ENERGY.LOW, TASK_ENERGY.MEDIUM, TASK_ENERGY.HIGH];

export interface RankedTask {
  task: Task;
  score: number;
  reasons: string[];
}

export interface BuildNowQueueOptions {
  availableTimeMin?: number;
  currentEnergy?: TaskEnergy;
  contextFilter?: TaskContext | null;
  now?: string;
  limit?: number;
}

export interface NowQueueResult {
  eligibleCount: number;
  items: RankedTask[];
  fallbackItems: RankedTask[];
}

function getEnergyDistance(a: TaskEnergy | null, b: TaskEnergy): number {
  const aIndex = ENERGY_ORDER.indexOf(a as TaskEnergy);
  const bIndex = ENERGY_ORDER.indexOf(b);

  if (aIndex === -1 || bIndex === -1) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.abs(aIndex - bIndex);
}

function dueScore(dueDate: string | null, nowMs: number): { score: number; reason: string | null } {
  if (!dueDate) {
    return { score: 0, reason: null };
  }

  const dueMs = Date.parse(dueDate);

  if (Number.isNaN(dueMs)) {
    return { score: 0, reason: null };
  }

  const diffMs = dueMs - nowMs;

  if (diffMs >= 0 && diffMs <= 24 * 60 * 60 * 1000) {
    return { score: 2, reason: 'due within 24h' };
  }

  if (diffMs > 24 * 60 * 60 * 1000 && diffMs <= 3 * 24 * 60 * 60 * 1000) {
    return { score: 1, reason: 'due within 3 days' };
  }

  return { score: 0, reason: null };
}

function compareDueDate(a: Task, b: Task): number {
  if (a.dueDate && b.dueDate) {
    const aMs = Date.parse(a.dueDate);
    const bMs = Date.parse(b.dueDate);

    if (!Number.isNaN(aMs) && !Number.isNaN(bMs) && aMs !== bMs) {
      return aMs - bMs;
    }
  }

  if (a.dueDate && !b.dueDate) {
    return -1;
  }

  if (!a.dueDate && b.dueDate) {
    return 1;
  }

  return 0;
}

function comparePriority(a: Task, b: Task): number {
  const aPriority = a.priority === TASK_PRIORITY.HIGH ? 1 : 0;
  const bPriority = b.priority === TASK_PRIORITY.HIGH ? 1 : 0;
  return bPriority - aPriority;
}

function compareCreatedAt(a: Task, b: Task): number {
  return Date.parse(a.createdAt) - Date.parse(b.createdAt);
}

function createReasons({
  task,
  availableTimeMin,
  currentEnergy,
  contextFilter,
  due
}: {
  task: Task;
  availableTimeMin: number;
  currentEnergy: TaskEnergy;
  contextFilter: TaskContext | null;
  due: { score: number; reason: string | null };
}): string[] {
  const reasons: string[] = [];

  if ((task.estimatedDurationMin ?? Number.POSITIVE_INFINITY) <= availableTimeMin) {
    reasons.push(`fits ${availableTimeMin}m`);
  } else {
    reasons.push(`stretch: ${task.estimatedDurationMin}m task`);
  }

  const energyDistance = getEnergyDistance(task.energy, currentEnergy);
  if (energyDistance === 0) {
    reasons.push('energy match');
  } else if (energyDistance === 1) {
    reasons.push('energy close match');
  } else {
    reasons.push('energy mismatch');
  }

  if (due.reason) {
    reasons.push(due.reason);
  }

  if (task.priority === TASK_PRIORITY.HIGH) {
    reasons.push('high priority');
  }

  if (contextFilter) {
    if (task.context === contextFilter) {
      reasons.push('context match');
    } else {
      reasons.push('outside selected context');
    }
  }

  return reasons;
}

function rankTask({
  task,
  availableTimeMin,
  currentEnergy,
  contextFilter,
  nowMs
}: {
  task: Task;
  availableTimeMin: number;
  currentEnergy: TaskEnergy;
  contextFilter: TaskContext | null;
  nowMs: number;
}): RankedTask {
  let score = 0;

  if ((task.estimatedDurationMin ?? Number.POSITIVE_INFINITY) <= availableTimeMin) {
    score += 3;
  } else {
    score -= 2;
  }

  const energyDistance = getEnergyDistance(task.energy, currentEnergy);
  if (energyDistance === 0) {
    score += 2;
  } else if (energyDistance === 1) {
    score += 1;
  }

  const due = dueScore(task.dueDate, nowMs);
  score += due.score;

  if (task.priority === TASK_PRIORITY.HIGH) {
    score += 1;
  }

  return {
    task,
    score,
    reasons: createReasons({ task, availableTimeMin, currentEnergy, contextFilter, due })
  };
}

function sortRankedItems(a: RankedTask, b: RankedTask): number {
  if (a.score !== b.score) {
    return b.score - a.score;
  }

  const dueCompare = compareDueDate(a.task, b.task);
  if (dueCompare !== 0) {
    return dueCompare;
  }

  const priorityCompare = comparePriority(a.task, b.task);
  if (priorityCompare !== 0) {
    return priorityCompare;
  }

  return compareCreatedAt(a.task, b.task);
}

function isPrimaryEligible(task: Task): task is Task & { estimatedDurationMin: number; energy: TaskEnergy } {
  return (
    task.status !== TASK_STATUS.COMPLETED &&
    typeof task.estimatedDurationMin === 'number' &&
    task.estimatedDurationMin > 0 &&
    Boolean(task.energy)
  );
}

export function buildNowQueue(
  tasks: Task[],
  {
    availableTimeMin = 30,
    currentEnergy = TASK_ENERGY.MEDIUM,
    contextFilter = null,
    now = new Date().toISOString(),
    limit = 5
  }: BuildNowQueueOptions = {}
): NowQueueResult {
  const nowMs = Date.parse(now);

  const eligible = tasks.filter(isPrimaryEligible);
  const ranked = eligible.map((task) => rankTask({ task, availableTimeMin, currentEnergy, contextFilter, nowMs }));

  const hasContextFilter = Boolean(contextFilter);
  const primaryRanked = (hasContextFilter ? ranked.filter(({ task }) => task.context === contextFilter) : ranked).sort(
    sortRankedItems
  );

  const fallbackRanked = hasContextFilter
    ? ranked.filter(({ task }) => task.context !== contextFilter).sort(sortRankedItems)
    : [];

  return {
    eligibleCount: eligible.length,
    items: primaryRanked.slice(0, limit),
    fallbackItems: fallbackRanked.slice(0, limit)
  };
}
