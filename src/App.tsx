import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent
} from 'react';
import './App.css';
import { TASK_CONTEXT, TASK_ENERGY, TASK_PRIORITY, TASK_STATUS, type Task, type TaskContext, type TaskEnergy } from './domain/task';
import { buildNowQueue } from './domain/tefq';
import {
  completeTaskAction,
  createTaskAction,
  deleteTaskAction,
  editTaskAction,
  exportTasksJson,
  importTasksAction,
  importTasksFromJson,
  loadTasksStateResult,
  persistTasksState,
  reopenTaskAction,
  tasksReducer
} from './state/tasks';
import {
  applyThemePreference,
  loadThemePreferenceResult,
  persistThemePreference,
  THEME_PREFERENCE,
  type ThemePreference
} from './theme';

const STATUS_FILTERS = {
  ALL: 'all',
  OPEN: 'open',
  COMPLETED: 'completed'
} as const;

const SORT_OPTIONS = {
  UPDATED_DESC: 'updated-desc',
  CREATED_DESC: 'created-desc',
  CREATED_ASC: 'created-asc',
  TITLE_ASC: 'title-asc'
} as const;

type StatusFilter = (typeof STATUS_FILTERS)[keyof typeof STATUS_FILTERS];
type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

const TASK_DURATION_OPTIONS = [5, 15, 30, 60, 90] as const;
const NOW_TIME_PRESETS = [15, 30, 60, 120] as const;

const CONTEXT_OPTIONS: { value: TaskContext; label: string }[] = [
  { value: TASK_CONTEXT.DEEP_WORK, label: 'Deep Work' },
  { value: TASK_CONTEXT.ADMIN, label: 'Admin' },
  { value: TASK_CONTEXT.ERRANDS, label: 'Errands' },
  { value: TASK_CONTEXT.CALLS, label: 'Calls' }
];

const ENERGY_OPTIONS: { value: TaskEnergy; label: string }[] = [
  { value: TASK_ENERGY.LOW, label: 'Low' },
  { value: TASK_ENERGY.MEDIUM, label: 'Medium' },
  { value: TASK_ENERGY.HIGH, label: 'High' }
];

function normalizeDescription(description: string): string | null {
  const trimmed = description.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeSelectValue<T extends string>(value: T | ''): T | null {
  return value ? value : null;
}

function normalizeDuration(value: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatContext(value: TaskContext | null): string {
  return CONTEXT_OPTIONS.find((option) => option.value === value)?.label ?? 'No context';
}

function formatEnergy(value: TaskEnergy | null): string {
  return ENERGY_OPTIONS.find((option) => option.value === value)?.label ?? 'Not set';
}

function byDateDesc(a: Task, b: Task, field: 'updatedAt' | 'createdAt'): number {
  return new Date(b[field]).getTime() - new Date(a[field]).getTime();
}

function selectVisibleTasks(
  tasks: Task[],
  { query, statusFilter, sortBy }: { query: string; statusFilter: StatusFilter; sortBy: SortOption }
): Task[] {
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (statusFilter !== STATUS_FILTERS.ALL && task.status !== statusFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [task.title, task.description ?? ''].join(' ').toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case SORT_OPTIONS.CREATED_DESC:
        return byDateDesc(a, b, 'createdAt');
      case SORT_OPTIONS.CREATED_ASC:
        return -byDateDesc(a, b, 'createdAt');
      case SORT_OPTIONS.TITLE_ASC:
        return a.title.localeCompare(b.title);
      case SORT_OPTIONS.UPDATED_DESC:
      default:
        return byDateDesc(a, b, 'updatedAt');
    }
  });

  return sorted;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

function readUploadedFileText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };

    reader.onerror = () => {
      reject(new Error('Unable to read import file'));
    };

    reader.readAsText(file);
  });
}

function App() {
  const loadResult = useMemo(() => loadTasksStateResult(), []);
  const skipInitialPersistRef = useRef(loadResult.skipInitialPersist);
  const loadThemeResult = useMemo(() => loadThemePreferenceResult(), []);
  const skipInitialThemePersistRef = useRef(loadThemeResult.skipInitialPersist);

  const [state, dispatch] = useReducer(tasksReducer, loadResult.state);
  const [themePreference, setThemePreference] = useState<ThemePreference>(loadThemeResult.preference);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<(typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY]>(TASK_PRIORITY.NORMAL);
  const [estimatedDurationMin, setEstimatedDurationMin] = useState('');
  const [energy, setEnergy] = useState<TaskEnergy | ''>('');
  const [context, setContext] = useState<TaskContext | ''>('');
  const [createError, setCreateError] = useState('');

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(STATUS_FILTERS.ALL);
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.UPDATED_DESC);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState<(typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY]>(TASK_PRIORITY.NORMAL);
  const [editDuration, setEditDuration] = useState('');
  const [editEnergy, setEditEnergy] = useState<TaskEnergy | ''>('');
  const [editContext, setEditContext] = useState<TaskContext | ''>('');
  const [editError, setEditError] = useState('');
  const [importError, setImportError] = useState('');

  const [availableTimePreset, setAvailableTimePreset] = useState<string>('30');
  const [availableTimeCustom, setAvailableTimeCustom] = useState('');
  const [nowEnergy, setNowEnergy] = useState<TaskEnergy>(TASK_ENERGY.MEDIUM);
  const [nowContext, setNowContext] = useState<TaskContext | ''>('');
  const [announceMessage, setAnnounceMessage] = useState('');

  const createTitleInputRef = useRef<HTMLInputElement | null>(null);
  const editTitleInputRef = useRef<HTMLInputElement | null>(null);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (skipInitialPersistRef.current) {
      skipInitialPersistRef.current = false;
      return;
    }

    persistTasksState(state);
  }, [state]);

  useEffect(() => {
    applyThemePreference(themePreference);
  }, [themePreference]);

  useEffect(() => {
    if (skipInitialThemePersistRef.current) {
      skipInitialThemePersistRef.current = false;
      return;
    }

    persistThemePreference(themePreference);
  }, [themePreference]);

  useEffect(() => {
    if (editingTaskId) {
      editTitleInputRef.current?.focus();
    }
  }, [editingTaskId]);

  const visibleTasks = useMemo(
    () =>
      selectVisibleTasks(state.tasks, {
        query,
        statusFilter,
        sortBy
      }),
    [query, sortBy, state.tasks, statusFilter]
  );

  const effectiveAvailableTimeMin =
    availableTimePreset === 'custom' ? normalizeDuration(availableTimeCustom) ?? 30 : Number(availableTimePreset);

  const nowQueue = useMemo(
    () =>
      buildNowQueue(state.tasks, {
        availableTimeMin: effectiveAvailableTimeMin,
        currentEnergy: nowEnergy,
        contextFilter: normalizeSelectValue(nowContext)
      }),
    [effectiveAvailableTimeMin, nowContext, nowEnergy, state.tasks]
  );

  function handleCreate(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    try {
      dispatch(
        createTaskAction({
          title,
          description: normalizeDescription(description),
          dueDate,
          priority,
          estimatedDurationMin: normalizeDuration(estimatedDurationMin),
          energy: normalizeSelectValue(energy),
          context: normalizeSelectValue(context)
        })
      );
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority(TASK_PRIORITY.NORMAL);
      setEstimatedDurationMin('');
      setEnergy('');
      setContext('');
      setCreateError('');
      setAnnounceMessage('Task added.');
      createTitleInputRef.current?.focus();
    } catch (error: unknown) {
      setCreateError(getErrorMessage(error));
    }
  }

  function startEdit(task: Task): void {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? '');
    setEditDueDate(task.dueDate ?? '');
    setEditPriority(task.priority ?? TASK_PRIORITY.NORMAL);
    setEditDuration(task.estimatedDurationMin ? String(task.estimatedDurationMin) : '');
    setEditEnergy(task.energy ?? '');
    setEditContext(task.context ?? '');
    setEditError('');
    setAnnounceMessage(`Editing ${task.title}.`);
  }

  function cancelEdit(shouldAnnounce = true): void {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDescription('');
    setEditDueDate('');
    setEditPriority(TASK_PRIORITY.NORMAL);
    setEditDuration('');
    setEditEnergy('');
    setEditContext('');
    setEditError('');
    if (shouldAnnounce) {
      setAnnounceMessage('Edit cancelled.');
    }
  }

  function saveEdit(taskId: string): void {
    try {
      dispatch(
        editTaskAction({
          id: taskId,
          title: editTitle,
          description: normalizeDescription(editDescription),
          dueDate: editDueDate,
          priority: editPriority,
          estimatedDurationMin: normalizeDuration(editDuration),
          energy: normalizeSelectValue(editEnergy),
          context: normalizeSelectValue(editContext)
        })
      );
      cancelEdit(false);
      setAnnounceMessage('Task updated.');
    } catch (error: unknown) {
      setEditError(getErrorMessage(error));
    }
  }

  function toggleCompleted(task: Task): void {
    dispatch(
      task.status === TASK_STATUS.COMPLETED ? reopenTaskAction({ id: task.id }) : completeTaskAction({ id: task.id })
    );
    setAnnounceMessage(task.status === TASK_STATUS.COMPLETED ? 'Task reopened.' : 'Task marked completed.');
  }

  function deleteTask(taskId: string): void {
    dispatch(deleteTaskAction({ id: taskId }));
    setAnnounceMessage('Task deleted.');
  }

  function handleExportTasksJson(): void {
    try {
      const json = exportTasksJson(state);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');

      downloadLink.href = url;
      downloadLink.download = `novel-task-tracker-tasks-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(url);

      setImportError('');
      setAnnounceMessage(`Exported ${state.tasks.length} ${state.tasks.length === 1 ? 'task' : 'tasks'} as JSON.`);
    } catch {
      setImportError('Unable to export tasks JSON.');
    }
  }

  async function handleImportTasksJson(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const fileContents = await readUploadedFileText(file);
      const importedTasks = importTasksFromJson(fileContents);

      dispatch(importTasksAction({ tasks: importedTasks }));
      cancelEdit(false);
      setCreateError('');
      setEditError('');
      setImportError('');
      setAnnounceMessage(`Imported ${importedTasks.length} ${importedTasks.length === 1 ? 'task' : 'tasks'} from JSON.`);
    } catch (error: unknown) {
      setImportError(getErrorMessage(error));
    } finally {
      event.target.value = '';
    }
  }

  function openImportTasksPicker(): void {
    importFileInputRef.current?.click();
  }

  function handleEditKeyboard(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Novel Task Tracker</h1>
        <div className="theme-control">
          <label htmlFor="theme-preference">Theme</label>
          <select
            id="theme-preference"
            value={themePreference}
            onChange={(event) => setThemePreference(event.target.value as ThemePreference)}
          >
            <option value={THEME_PREFERENCE.SYSTEM}>System</option>
            <option value={THEME_PREFERENCE.LIGHT}>Light</option>
            <option value={THEME_PREFERENCE.DARK}>Dark</option>
          </select>
        </div>
      </header>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announceMessage}
      </p>

      <section className="panel panel--now" aria-label="Now queue">
        <h2>Now queue (TEFQ)</h2>
        <p className="panel-copy" id="now-queue-hint">
          Pick your current constraints to get deterministic “do this now” suggestions.
        </p>

        <fieldset className="fieldset-reset">
          <legend className="sr-only">Now queue filters</legend>
          <div className="controls" role="group" aria-describedby="now-queue-hint">
            <div className="control">
              <label htmlFor="now-time">Available time</label>
              <select
                id="now-time"
                value={availableTimePreset}
                onChange={(event) => setAvailableTimePreset(event.target.value)}
              >
                {NOW_TIME_PRESETS.map((minutes) => (
                  <option key={minutes} value={String(minutes)}>
                    {minutes} min
                  </option>
                ))}
                <option value="custom">Custom</option>
              </select>
            </div>

            {availableTimePreset === 'custom' ? (
              <div className="control">
                <label htmlFor="now-time-custom">Custom minutes</label>
                <input
                  id="now-time-custom"
                  type="number"
                  min="1"
                  value={availableTimeCustom}
                  onChange={(event) => setAvailableTimeCustom(event.target.value)}
                />
              </div>
            ) : null}

            <div className="control">
              <label htmlFor="now-energy">Current energy</label>
              <select
                id="now-energy"
                value={nowEnergy}
                onChange={(event) => setNowEnergy(event.target.value as TaskEnergy)}
              >
                {ENERGY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="control">
              <label htmlFor="now-context">Context (optional)</label>
              <select
                id="now-context"
                value={nowContext}
                onChange={(event) => setNowContext(event.target.value as TaskContext | '')}
              >
                <option value="">Any context</option>
                {CONTEXT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {nowQueue.eligibleCount === 0 ? (
          <p className="empty-state">
            No TEFQ-eligible tasks yet. Add estimated duration and energy on tasks to unlock Now suggestions.
          </p>
        ) : null}

        {nowQueue.eligibleCount > 0 && nowQueue.items.length === 0 && nowContext ? (
          <>
            <p className="empty-state">
              No matches for the selected context. Try relaxing the context filter or review closest alternatives below.
            </p>
            {nowQueue.fallbackItems.length > 0 ? (
              <ul className="task-list" aria-label="Now queue fallback">
                {nowQueue.fallbackItems.map(({ task, score, reasons }) => (
                  <li key={`fallback-${task.id}`} className="task-item task-item--open">
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <span className="status-badge status-badge--open">Score {score}</span>
                    </div>
                    <div className="reason-chips">
                      {reasons.slice(0, 3).map((reason) => (
                        <span key={`${task.id}-${reason}`} className="reason-chip">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}

        {nowQueue.items.length > 0 ? (
          <ul className="task-list" aria-label="Now queue recommendations">
            {nowQueue.items.map(({ task, score, reasons }) => (
              <li key={`now-${task.id}`} className="task-item task-item--open">
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <span className="status-badge status-badge--open">Score {score}</span>
                </div>
                <div className="reason-chips">
                  {reasons.slice(0, 3).map((reason) => (
                    <span key={`${task.id}-${reason}`} className="reason-chip">
                      {reason}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="panel panel--create" aria-label="Create task">
        <h2>Add task</h2>
        <form onSubmit={handleCreate} className="task-form" aria-label="Add task form">
          <label htmlFor="task-title">Title</label>
          <input
            id="task-title"
            name="task-title"
            value={title}
            ref={createTitleInputRef}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What do you need to do?"
          />

          <label htmlFor="task-description">Description (optional)</label>
          <textarea
            id="task-description"
            name="task-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="Add context or notes"
          />

          <fieldset className="fieldset-reset">
            <legend className="sr-only">Optional task metadata</legend>
            <div className="controls">
              <div className="control">
                <label htmlFor="task-due-date">Due date (optional)</label>
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </div>

              <div className="control">
                <label htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as typeof priority)}
                >
                  <option value={TASK_PRIORITY.NORMAL}>Normal</option>
                  <option value={TASK_PRIORITY.HIGH}>High</option>
                </select>
              </div>

              <div className="control">
                <label htmlFor="task-duration">Estimated duration</label>
                <select
                  id="task-duration"
                  value={estimatedDurationMin}
                  onChange={(event) => setEstimatedDurationMin(event.target.value)}
                >
                  <option value="">Not set</option>
                  {TASK_DURATION_OPTIONS.map((minutes) => (
                    <option key={minutes} value={String(minutes)}>
                      {minutes} min
                    </option>
                  ))}
                </select>
              </div>

              <div className="control">
                <label htmlFor="task-energy">Energy required</label>
                <select
                  id="task-energy"
                  value={energy}
                  onChange={(event) => setEnergy(event.target.value as TaskEnergy | '')}
                >
                  <option value="">Not set</option>
                  {ENERGY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="control">
                <label htmlFor="task-context">Context</label>
                <select
                  id="task-context"
                  value={context}
                  onChange={(event) => setContext(event.target.value as TaskContext | '')}
                >
                  <option value="">No context</option>
                  {CONTEXT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {createError ? (
            <p className="error" role="alert">
              {createError}
            </p>
          ) : null}

          <button type="submit">Add task</button>
        </form>
      </section>

      <section className="panel panel--tasks" aria-label="Filter and sort tasks">
        <h2>Tasks</h2>
        <fieldset className="fieldset-reset">
          <legend className="sr-only">Task list filters</legend>
          <div className="controls">
            <div className="control">
              <label htmlFor="search-tasks">Search</label>
              <input
                id="search-tasks"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title or description"
              />
            </div>

            <div className="control">
              <label htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                <option value={STATUS_FILTERS.ALL}>All</option>
                <option value={STATUS_FILTERS.OPEN}>Open</option>
                <option value={STATUS_FILTERS.COMPLETED}>Completed</option>
              </select>
            </div>

            <div className="control">
              <label htmlFor="sort-by">Sort</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
              >
                <option value={SORT_OPTIONS.UPDATED_DESC}>Recently updated</option>
                <option value={SORT_OPTIONS.CREATED_DESC}>Newest first</option>
                <option value={SORT_OPTIONS.CREATED_ASC}>Oldest first</option>
                <option value={SORT_OPTIONS.TITLE_ASC}>Title A-Z</option>
              </select>
            </div>
          </div>
        </fieldset>

        <div className="task-actions">
          <button type="button" onClick={handleExportTasksJson}>
            Export JSON
          </button>
          <button type="button" className="secondary" onClick={openImportTasksPicker}>
            Import JSON
          </button>
          <input
            ref={importFileInputRef}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={(event) => {
              void handleImportTasksJson(event);
            }}
          />
        </div>

        {importError ? (
          <p className="error" role="alert">
            {importError}
          </p>
        ) : null}

        <p className="sr-only" role="status" aria-live="polite">
          Showing {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}.
        </p>

        {state.tasks.length === 0 ? (
          <p className="empty-state">No tasks yet. Add your first task to get started.</p>
        ) : null}

        {state.tasks.length > 0 && visibleTasks.length === 0 ? (
          <p className="empty-state">No tasks match your current search or filters.</p>
        ) : null}

        <ul className="task-list" aria-label="Task list">
          {visibleTasks.map((task) => {
            const isEditing = editingTaskId === task.id;
            const isCompleted = task.status === TASK_STATUS.COMPLETED;

            return (
              <li key={task.id} className={`task-item ${isCompleted ? 'task-item--completed' : 'task-item--open'}`}>
                {isEditing ? (
                  <div className="task-edit" onKeyDown={handleEditKeyboard}>
                    <label htmlFor={`edit-title-${task.id}`}>Edit title</label>
                    <input
                      id={`edit-title-${task.id}`}
                      value={editTitle}
                      ref={editTitleInputRef}
                      onChange={(event) => setEditTitle(event.target.value)}
                    />

                    <label htmlFor={`edit-description-${task.id}`}>Edit description</label>
                    <textarea
                      id={`edit-description-${task.id}`}
                      rows={3}
                      value={editDescription}
                      onChange={(event) => setEditDescription(event.target.value)}
                    />

                    <fieldset className="fieldset-reset">
                      <legend className="sr-only">Edit task metadata</legend>
                      <div className="controls">
                        <div className="control">
                          <label htmlFor={`edit-due-date-${task.id}`}>Edit due date</label>
                          <input
                            id={`edit-due-date-${task.id}`}
                            type="date"
                            value={editDueDate}
                            onChange={(event) => setEditDueDate(event.target.value)}
                          />
                        </div>

                        <div className="control">
                          <label htmlFor={`edit-priority-${task.id}`}>Edit priority</label>
                          <select
                            id={`edit-priority-${task.id}`}
                            value={editPriority}
                            onChange={(event) => setEditPriority(event.target.value as typeof editPriority)}
                          >
                            <option value={TASK_PRIORITY.NORMAL}>Normal</option>
                            <option value={TASK_PRIORITY.HIGH}>High</option>
                          </select>
                        </div>

                        <div className="control">
                          <label htmlFor={`edit-duration-${task.id}`}>Edit estimated duration</label>
                          <select
                            id={`edit-duration-${task.id}`}
                            value={editDuration}
                            onChange={(event) => setEditDuration(event.target.value)}
                          >
                            <option value="">Not set</option>
                            {TASK_DURATION_OPTIONS.map((minutes) => (
                              <option key={minutes} value={String(minutes)}>
                                {minutes} min
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="control">
                          <label htmlFor={`edit-energy-${task.id}`}>Edit energy required</label>
                          <select
                            id={`edit-energy-${task.id}`}
                            value={editEnergy}
                            onChange={(event) => setEditEnergy(event.target.value as TaskEnergy | '')}
                          >
                            <option value="">Not set</option>
                            {ENERGY_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="control">
                          <label htmlFor={`edit-context-${task.id}`}>Edit context</label>
                          <select
                            id={`edit-context-${task.id}`}
                            value={editContext}
                            onChange={(event) => setEditContext(event.target.value as TaskContext | '')}
                          >
                            <option value="">No context</option>
                            {CONTEXT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </fieldset>

                    {editError ? (
                      <p className="error" role="alert">
                        {editError}
                      </p>
                    ) : null}

                    <div className="task-actions">
                      <button type="button" onClick={() => saveEdit(task.id)} aria-label={`Save changes for ${task.title}`}>
                        Save
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => cancelEdit()}
                        aria-label={`Cancel editing ${task.title}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <span className={`status-badge ${isCompleted ? 'status-badge--completed' : 'status-badge--open'}`}>
                        {isCompleted ? 'Completed' : 'Open'}
                      </span>
                    </div>
                    {task.description ? <p className="task-description">{task.description}</p> : null}
                    <p className="task-meta">Updated: {new Date(task.updatedAt).toLocaleString()}</p>
                    <p className="task-meta task-meta--stacked">
                      <span>Due: {task.dueDate ?? 'Not set'}</span>
                      <span>Priority: {task.priority === TASK_PRIORITY.HIGH ? 'High' : 'Normal'}</span>
                      <span>Duration: {task.estimatedDurationMin ? `${task.estimatedDurationMin} min` : 'Not set'}</span>
                      <span>Energy: {formatEnergy(task.energy)}</span>
                      <span>Context: {formatContext(task.context)}</span>
                    </p>
                    <div className="task-actions">
                      <button type="button" onClick={() => startEdit(task)} aria-label={`Edit ${task.title}`}>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCompleted(task)}
                        aria-label={`${isCompleted ? 'Reopen' : 'Mark completed'} ${task.title}`}
                      >
                        {isCompleted ? 'Reopen' : 'Mark completed'}
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => deleteTask(task.id)}
                        aria-label={`Delete ${task.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

export default App;
