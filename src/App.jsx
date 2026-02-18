import { useMemo, useReducer, useState } from 'react';
import './App.css';
import {
  completeTaskAction,
  createTaskAction,
  deleteTaskAction,
  editTaskAction,
  initialTasksState,
  reopenTaskAction,
  tasksReducer
} from './state/tasks';

const STATUS_FILTERS = {
  ALL: 'all',
  OPEN: 'open',
  COMPLETED: 'completed'
};

const SORT_OPTIONS = {
  UPDATED_DESC: 'updated-desc',
  CREATED_DESC: 'created-desc',
  CREATED_ASC: 'created-asc',
  TITLE_ASC: 'title-asc'
};

function normalizeDescription(description) {
  const trimmed = description.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function byDateDesc(a, b, field) {
  return new Date(b[field]).getTime() - new Date(a[field]).getTime();
}

function selectVisibleTasks(tasks, { query, statusFilter, sortBy }) {
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

function App() {
  const [state, dispatch] = useReducer(tasksReducer, initialTasksState);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [createError, setCreateError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS.ALL);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.UPDATED_DESC);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editError, setEditError] = useState('');

  const visibleTasks = useMemo(
    () =>
      selectVisibleTasks(state.tasks, {
        query,
        statusFilter,
        sortBy
      }),
    [query, sortBy, state.tasks, statusFilter]
  );

  function handleCreate(event) {
    event.preventDefault();

    try {
      dispatch(
        createTaskAction({
          title,
          description: normalizeDescription(description)
        })
      );
      setTitle('');
      setDescription('');
      setCreateError('');
    } catch (error) {
      setCreateError(error.message);
    }
  }

  function startEdit(task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? '');
    setEditError('');
  }

  function cancelEdit() {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDescription('');
    setEditError('');
  }

  function saveEdit(taskId) {
    try {
      dispatch(
        editTaskAction({
          id: taskId,
          title: editTitle,
          description: normalizeDescription(editDescription)
        })
      );
      cancelEdit();
    } catch (error) {
      setEditError(error.message);
    }
  }

  function toggleCompleted(task) {
    dispatch(
      task.status === 'completed' ? reopenTaskAction({ id: task.id }) : completeTaskAction({ id: task.id })
    );
  }

  return (
    <main className="app">
      <h1>Novel Task Tracker</h1>

      <section className="panel" aria-label="Create task">
        <h2>Add task</h2>
        <form onSubmit={handleCreate} className="task-form">
          <label htmlFor="task-title">Title</label>
          <input
            id="task-title"
            name="task-title"
            value={title}
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

          {createError ? (
            <p className="error" role="alert">
              {createError}
            </p>
          ) : null}

          <button type="submit">Add task</button>
        </form>
      </section>

      <section className="panel" aria-label="Filter and sort tasks">
        <h2>Tasks</h2>
        <div className="controls">
          <label htmlFor="search-tasks">Search</label>
          <input
            id="search-tasks"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title or description"
          />

          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value={STATUS_FILTERS.ALL}>All</option>
            <option value={STATUS_FILTERS.OPEN}>Open</option>
            <option value={STATUS_FILTERS.COMPLETED}>Completed</option>
          </select>

          <label htmlFor="sort-by">Sort</label>
          <select id="sort-by" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value={SORT_OPTIONS.UPDATED_DESC}>Recently updated</option>
            <option value={SORT_OPTIONS.CREATED_DESC}>Newest first</option>
            <option value={SORT_OPTIONS.CREATED_ASC}>Oldest first</option>
            <option value={SORT_OPTIONS.TITLE_ASC}>Title A-Z</option>
          </select>
        </div>

        {state.tasks.length === 0 ? (
          <p className="empty-state">No tasks yet. Add your first task to get started.</p>
        ) : null}

        {state.tasks.length > 0 && visibleTasks.length === 0 ? (
          <p className="empty-state">No tasks match your current search or filters.</p>
        ) : null}

        <ul className="task-list" aria-label="Task list">
          {visibleTasks.map((task) => {
            const isEditing = editingTaskId === task.id;
            const isCompleted = task.status === 'completed';

            return (
              <li key={task.id} className={`task-item ${isCompleted ? 'task-item--completed' : 'task-item--open'}`}>
                {isEditing ? (
                  <div className="task-edit">
                    <label htmlFor={`edit-title-${task.id}`}>Edit title</label>
                    <input
                      id={`edit-title-${task.id}`}
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                    />

                    <label htmlFor={`edit-description-${task.id}`}>Edit description</label>
                    <textarea
                      id={`edit-description-${task.id}`}
                      rows={3}
                      value={editDescription}
                      onChange={(event) => setEditDescription(event.target.value)}
                    />

                    {editError ? (
                      <p className="error" role="alert">
                        {editError}
                      </p>
                    ) : null}

                    <div className="task-actions">
                      <button type="button" onClick={() => saveEdit(task.id)}>
                        Save
                      </button>
                      <button type="button" className="secondary" onClick={cancelEdit}>
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
                    <div className="task-actions">
                      <button type="button" onClick={() => startEdit(task)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => toggleCompleted(task)}>
                        {isCompleted ? 'Reopen' : 'Mark completed'}
                      </button>
                      <button type="button" className="danger" onClick={() => dispatch(deleteTaskAction({ id: task.id }))}>
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
