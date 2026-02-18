import { TASK_STATUS, assertValidTitle, createTask, normalizeTitle } from '../domain/task';

export const TASK_ACTIONS = {
  CREATE: 'tasks/create',
  EDIT: 'tasks/edit',
  COMPLETE: 'tasks/complete',
  REOPEN: 'tasks/reopen',
  DELETE: 'tasks/delete'
};

export const initialTasksState = {
  tasks: []
};

export function createTaskAction({ title, description = null, now, id } = {}) {
  return {
    type: TASK_ACTIONS.CREATE,
    payload: createTask({ title, description, now, id })
  };
}

export function editTaskAction({ id, title, description, now = new Date().toISOString() } = {}) {
  if (!id) {
    throw new Error('Task id is required');
  }

  if (title !== undefined) {
    assertValidTitle(title);
  }

  return {
    type: TASK_ACTIONS.EDIT,
    payload: {
      id,
      now,
      title: title === undefined ? undefined : normalizeTitle(title),
      description
    }
  };
}

export function completeTaskAction({ id, now = new Date().toISOString() } = {}) {
  if (!id) {
    throw new Error('Task id is required');
  }

  return {
    type: TASK_ACTIONS.COMPLETE,
    payload: { id, now }
  };
}

export function reopenTaskAction({ id, now = new Date().toISOString() } = {}) {
  if (!id) {
    throw new Error('Task id is required');
  }

  return {
    type: TASK_ACTIONS.REOPEN,
    payload: { id, now }
  };
}

export function deleteTaskAction({ id } = {}) {
  if (!id) {
    throw new Error('Task id is required');
  }

  return {
    type: TASK_ACTIONS.DELETE,
    payload: { id }
  };
}

function mapTaskById(tasks, id, updater) {
  return tasks.map((task) => (task.id === id ? updater(task) : task));
}

export function tasksReducer(state = initialTasksState, action = {}) {
  switch (action.type) {
    case TASK_ACTIONS.CREATE:
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      };

    case TASK_ACTIONS.EDIT: {
      const { id, now, title, description } = action.payload;
      return {
        ...state,
        tasks: mapTaskById(state.tasks, id, (task) => ({
          ...task,
          title: title === undefined ? task.title : title,
          description: description === undefined ? task.description : description,
          updatedAt: now
        }))
      };
    }

    case TASK_ACTIONS.COMPLETE: {
      const { id, now } = action.payload;
      return {
        ...state,
        tasks: mapTaskById(state.tasks, id, (task) => {
          if (task.status === TASK_STATUS.COMPLETED) {
            return task;
          }

          return {
            ...task,
            status: TASK_STATUS.COMPLETED,
            completedAt: now,
            updatedAt: now
          };
        })
      };
    }

    case TASK_ACTIONS.REOPEN: {
      const { id, now } = action.payload;
      return {
        ...state,
        tasks: mapTaskById(state.tasks, id, (task) => {
          if (task.status === TASK_STATUS.OPEN) {
            return task;
          }

          return {
            ...task,
            status: TASK_STATUS.OPEN,
            completedAt: null,
            updatedAt: now
          };
        })
      };
    }

    case TASK_ACTIONS.DELETE: {
      const { id } = action.payload;
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== id)
      };
    }

    default:
      return state;
  }
}

export function createTasksStore(initialState = initialTasksState) {
  let state = initialState;

  return {
    getState() {
      return state;
    },

    dispatch(action) {
      state = tasksReducer(state, action);
      return action;
    }
  };
}
