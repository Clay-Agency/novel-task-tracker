import { afterEach, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import { TASKS_STORAGE_KEY, TASKS_STORAGE_VERSION } from './state/tasks';

function createMockStorage() {
  const storage = new Map();

  return {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    }
  };
}

function setCreateForm({ title, description } = {}) {
  if (title !== undefined) {
    fireEvent.change(screen.getByLabelText(/^title$/i), { target: { value: title } });
  }

  if (description !== undefined) {
    fireEvent.change(screen.getByLabelText(/description \(optional\)/i), {
      target: { value: description }
    });
  }
}

function createTask({ title, description } = {}) {
  setCreateForm({ title, description });
  fireEvent.click(screen.getByRole('button', { name: /add task/i }));
}

function getVisibleTaskTitles() {
  return screen.getAllByRole('heading', { level: 3 }).map((node) => node.textContent);
}

describe('App core UI flows', () => {
  let originalLocalStorage;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-19T00:00:00.000Z'));

    originalLocalStorage = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: createMockStorage()
    });
  });

  afterEach(() => {
    vi.useRealTimers();

    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: originalLocalStorage
    });
  });

  it('shows initial empty state', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /novel task tracker/i })).toBeInTheDocument();
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('validates create form and adds a task', () => {
    render(<App />);

    createTask({ title: '   ' });
    expect(screen.getByRole('alert')).toHaveTextContent(/title is required/i);

    createTask({ title: 'Draft opening scene', description: 'Set the conflict' });

    expect(screen.getByRole('heading', { name: /draft opening scene/i })).toBeInTheDocument();
    expect(screen.getByText(/set the conflict/i)).toBeInTheDocument();
    expect(screen.queryByText(/no tasks yet/i)).not.toBeInTheDocument();
  });

  it('supports edit, complete/reopen, and delete', () => {
    render(<App />);

    createTask({ title: 'Write chapter plan' });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.change(screen.getByLabelText(/edit title/i), {
      target: { value: 'Write detailed chapter plan' }
    });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    expect(screen.getByRole('heading', { name: /write detailed chapter plan/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /mark completed/i }));
    expect(screen.getByText('Completed', { selector: '.status-badge' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /reopen/i }));
    expect(screen.getByText('Open', { selector: '.status-badge' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('supports search/filter/sort controls', () => {
    render(<App />);

    vi.setSystemTime(new Date('2026-02-19T00:00:01.000Z'));
    createTask({ title: 'Bravo item', description: 'secondary note' });

    vi.setSystemTime(new Date('2026-02-19T00:00:02.000Z'));
    createTask({ title: 'Alpha item', description: 'primary note' });

    vi.setSystemTime(new Date('2026-02-19T00:00:03.000Z'));
    createTask({ title: 'Charlie item', description: 'secondary note' });

    fireEvent.change(screen.getByLabelText(/^search$/i), { target: { value: 'primary' } });
    expect(getVisibleTaskTitles()).toEqual(['Alpha item']);

    fireEvent.change(screen.getByLabelText(/^search$/i), { target: { value: '' } });
    fireEvent.click(screen.getAllByRole('button', { name: /mark completed/i })[0]);

    fireEvent.change(screen.getByLabelText(/^status$/i), { target: { value: 'completed' } });
    expect(screen.getByText('Completed', { selector: '.status-badge' })).toBeInTheDocument();
    expect(getVisibleTaskTitles()).toHaveLength(1);

    fireEvent.change(screen.getByLabelText(/^status$/i), { target: { value: 'all' } });

    fireEvent.change(screen.getByLabelText(/^sort$/i), { target: { value: 'title-asc' } });
    expect(getVisibleTaskTitles()).toEqual(['Alpha item', 'Bravo item', 'Charlie item']);

    fireEvent.change(screen.getByLabelText(/^sort$/i), { target: { value: 'created-asc' } });
    expect(getVisibleTaskTitles()).toEqual(['Bravo item', 'Alpha item', 'Charlie item']);
  });

  it('persists tasks across remounts', () => {
    const { unmount } = render(<App />);

    createTask({ title: 'Persisted task', description: 'Keep between reloads' });

    const persisted = JSON.parse(window.localStorage.getItem(TASKS_STORAGE_KEY));
    expect(persisted.version).toBe(TASKS_STORAGE_VERSION);
    expect(persisted.payload.tasks).toHaveLength(1);

    unmount();
    render(<App />);

    const taskItem = screen.getByRole('listitem');
    expect(within(taskItem).getByRole('heading', { name: /persisted task/i })).toBeInTheDocument();
    expect(within(taskItem).getByText(/keep between reloads/i)).toBeInTheDocument();
  });

  it('does not clobber future-version storage on initial mount', () => {
    const futurePayload = {
      version: TASKS_STORAGE_VERSION + 1,
      payload: {
        tasks: [{ id: 'future-1', title: 'Future task' }]
      }
    };

    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(futurePayload));

    render(<App />);

    expect(JSON.parse(window.localStorage.getItem(TASKS_STORAGE_KEY))).toEqual(futurePayload);
  });
});
