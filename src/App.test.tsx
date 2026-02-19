import { afterEach, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import { TASKS_STORAGE_KEY, TASKS_STORAGE_VERSION } from './state/tasks';

interface MockStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

function createMockStorage(): MockStorage {
  const storage = new Map<string, string>();

  return {
    getItem(key) {
      return storage.has(key) ? storage.get(key)! : null;
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

function setCreateForm({ title, description, dueDate, priority, duration, energy, context } = {} as {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  duration?: string;
  energy?: string;
  context?: string;
}): void {
  if (title !== undefined) {
    fireEvent.change(screen.getByLabelText(/^title$/i), { target: { value: title } });
  }

  if (description !== undefined) {
    fireEvent.change(screen.getByLabelText(/description \(optional\)/i), {
      target: { value: description }
    });
  }

  if (dueDate !== undefined) {
    fireEvent.change(screen.getByLabelText(/due date \(optional\)/i), { target: { value: dueDate } });
  }

  if (priority !== undefined) {
    fireEvent.change(screen.getByLabelText(/^priority$/i), { target: { value: priority } });
  }

  if (duration !== undefined) {
    fireEvent.change(screen.getByLabelText(/^estimated duration$/i), { target: { value: duration } });
  }

  if (energy !== undefined) {
    fireEvent.change(screen.getByLabelText(/^energy required$/i), { target: { value: energy } });
  }

  if (context !== undefined) {
    fireEvent.change(screen.getByLabelText(/^context$/i), { target: { value: context } });
  }
}

function createTask({ title, description, dueDate, priority, duration, energy, context } = {} as {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  duration?: string;
  energy?: string;
  context?: string;
}): void {
  setCreateForm({ title, description, dueDate, priority, duration, energy, context });
  fireEvent.click(screen.getByRole('button', { name: /add task/i }));
}

function getVisibleTaskTitles(): string[] {
  const taskList = screen.getByRole('list', { name: /task list/i });
  return within(taskList)
    .getAllByRole('heading', { level: 3 })
    .map((node) => node.textContent ?? '');
}

describe('App core UI flows', () => {
  let originalLocalStorage: typeof globalThis.localStorage | undefined;

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

  it('shows initial empty state and TEFQ metadata guidance', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /novel task tracker/i })).toBeInTheDocument();
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no tefq-eligible tasks yet/i)).toBeInTheDocument();
  });

  it('validates create form and adds a task with metadata', () => {
    render(<App />);

    createTask({ title: '   ' });
    expect(screen.getByRole('alert')).toHaveTextContent(/title is required/i);

    createTask({
      title: 'Draft opening scene',
      description: 'Set the conflict',
      dueDate: '2026-02-20',
      priority: 'high',
      duration: '30',
      energy: 'high',
      context: 'deep-work'
    });

    const taskList = screen.getByRole('list', { name: /task list/i });
    expect(within(taskList).getByRole('heading', { name: /draft opening scene/i })).toBeInTheDocument();
    expect(within(taskList).getByText(/set the conflict/i)).toBeInTheDocument();
    expect(within(taskList).getByText(/priority: high/i)).toBeInTheDocument();
    expect(screen.queryByText(/no tasks yet/i)).not.toBeInTheDocument();
  });

  it('supports edit, complete/reopen, and delete including TEFQ fields', () => {
    render(<App />);

    createTask({ title: 'Write chapter plan', duration: '15', energy: 'low' });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.change(screen.getByLabelText(/edit title/i), {
      target: { value: 'Write detailed chapter plan' }
    });
    fireEvent.change(screen.getByLabelText(/edit estimated duration/i), {
      target: { value: '60' }
    });
    fireEvent.change(screen.getByLabelText(/edit energy required/i), {
      target: { value: 'high' }
    });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    const taskList = screen.getByRole('list', { name: /task list/i });
    expect(within(taskList).getByRole('heading', { name: /write detailed chapter plan/i })).toBeInTheDocument();
    expect(within(taskList).getByText(/duration: 60 min/i)).toBeInTheDocument();
    expect(within(taskList).getByText(/energy: high/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /mark completed/i }));
    expect(screen.getByText('Completed', { selector: '.status-badge' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /reopen/i }));
    expect(screen.getByText('Open', { selector: '.status-badge' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });


  it('supports keyboard escape to cancel edit mode and exposes task-specific action labels', () => {
    render(<App />);

    createTask({ title: 'Keyboard task' });

    fireEvent.click(screen.getByRole('button', { name: /edit keyboard task/i }));
    const editTitleInput = screen.getByLabelText(/edit title/i);
    fireEvent.change(editTitleInput, { target: { value: 'Changed title' } });

    fireEvent.keyDown(editTitleInput, { key: 'Escape' });

    expect(screen.queryByLabelText(/edit title/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /keyboard task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark completed keyboard task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete keyboard task/i })).toBeInTheDocument();
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

  it('renders TEFQ recommendations and fallback context block with reason chips', () => {
    render(<App />);

    createTask({ title: 'Email editor', duration: '15', energy: 'low', context: 'admin', dueDate: '2026-02-20' });
    createTask({ title: 'Outline chapter', duration: '30', energy: 'medium', context: 'deep-work' });

    const recommendationList = screen.getByRole('list', { name: /now queue recommendations/i });
    expect(within(recommendationList).getByRole('heading', { name: /outline chapter/i })).toBeInTheDocument();

    const firstRecItem = within(recommendationList).getAllByRole('listitem')[0];
    expect(within(firstRecItem).getAllByText(/fits 30m|energy match|due within/i).length).toBeGreaterThanOrEqual(2);

    fireEvent.change(screen.getByLabelText(/context \(optional\)/i), { target: { value: 'calls' } });

    expect(screen.getByText(/no matches for the selected context/i)).toBeInTheDocument();
    const fallbackList = screen.getByRole('list', { name: /now queue fallback/i });
    expect(within(fallbackList).getByRole('heading', { name: /email editor/i })).toBeInTheDocument();
  });

  it('persists tasks across remounts', () => {
    const { unmount } = render(<App />);

    createTask({ title: 'Persisted task', description: 'Keep between reloads', duration: '30', energy: 'medium' });

    const rawPersisted = window.localStorage.getItem(TASKS_STORAGE_KEY);
    expect(rawPersisted).not.toBeNull();
    const persisted = JSON.parse(rawPersisted ?? '{}') as { version: number; payload: { tasks: unknown[] } };
    expect(persisted.version).toBe(TASKS_STORAGE_VERSION);
    expect(persisted.payload.tasks).toHaveLength(1);

    unmount();
    render(<App />);

    const taskList = screen.getByRole('list', { name: /task list/i });
    const taskItem = within(taskList).getByRole('listitem');
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

    expect(JSON.parse(window.localStorage.getItem(TASKS_STORAGE_KEY) ?? '{}')).toEqual(futurePayload);
  });
});
