export const Status = Object.freeze({
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
});

export const STATUSES = [Status.TODO, Status.IN_PROGRESS, Status.DONE];

export const STATUS_LABELS = {
  [Status.TODO]: 'To do',
  [Status.IN_PROGRESS]: 'In progress',
  [Status.DONE]: 'Done',
};

const ALLOWED_TRANSITIONS = {
  [Status.TODO]: [Status.IN_PROGRESS],
  [Status.IN_PROGRESS]: [Status.TODO, Status.DONE],
  [Status.DONE]: [Status.IN_PROGRESS],
};

export function canTransition(from, to) {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function validateTitle(title) {
  if (typeof title !== 'string') return 'Title is required.';
  const value = title.trim();
  if (!value) return 'Title is required.';
  if (value.length > 120) return 'Title must be 120 characters or fewer.';
  return '';
}

export function validateDueDate(dueDate) {
  if (!dueDate) return '';
  if (typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return 'Due date must use YYYY-MM-DD.';
  }
  const [year, month, day] = dueDate.split('-').map(Number);
  const parsed = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return 'Due date is invalid.';
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() + 1 !== month ||
    parsed.getDate() !== day
  ) {
    return 'Due date is invalid.';
  }
  return '';
}

function assertValidDate(dueDate) {
  const error = validateDueDate(dueDate);
  if (error) throw new Error(error);
}

function assertValidTitle(title) {
  const error = validateTitle(title);
  if (error) throw new Error(error);
}

export function createTask(
  { title, assignee = '', dueDate = '' },
  { id = globalThis.crypto?.randomUUID?.() ?? `task-${Date.now()}-${Math.random()}`, now = new Date().toISOString() } = {},
) {
  assertValidTitle(title);
  assertValidDate(dueDate);
  return {
    id,
    title: title.trim(),
    status: Status.TODO,
    assignee: assignee || '',
    dueDate: dueDate || '',
    createdAt: now,
  };
}

export function updateTask(tasks, id, patch) {
  return tasks.map((task) => {
    if (task.id !== id) return task;
    const next = { ...task };
    if ('title' in patch) {
      assertValidTitle(patch.title);
      next.title = patch.title.trim();
    }
    if ('assignee' in patch) {
      next.assignee = patch.assignee || '';
    }
    if ('dueDate' in patch) {
      assertValidDate(patch.dueDate);
      next.dueDate = patch.dueDate || '';
    }
    return next;
  });
}

export function deleteTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

export function moveTask(tasks, id, to) {
  return tasks.map((task) => {
    if (task.id !== id) return task;
    if (!STATUSES.includes(to)) throw new Error('Unknown status.');
    if (!canTransition(task.status, to)) {
      throw new Error(`Illegal transition: ${task.status} -> ${to}`);
    }
    return { ...task, status: to };
  });
}

export function countByStatus(tasks) {
  return tasks.reduce(
    (counts, task) => {
      counts[task.status] = (counts[task.status] || 0) + 1;
      return counts;
    },
    { [Status.TODO]: 0, [Status.IN_PROGRESS]: 0, [Status.DONE]: 0 },
  );
}

export function classifyDueDate(dueDate, today) {
  if (!dueDate) return 'none';
  if (validateDueDate(dueDate)) return 'invalid';
  const due = Date.parse(`${dueDate}T00:00:00`);
  const base = Date.parse(`${today}T00:00:00`);
  if (Number.isNaN(base)) return 'invalid';
  const days = Math.round((due - base) / 86_400_000);
  if (days < 0) return 'overdue';
  if (days <= 2) return 'due-soon';
  return 'normal';
}

export function addMember(members, name) {
  const value = String(name ?? '').trim();
  if (!value) throw new Error('Member name is required.');
  if (members.some((member) => member.toLowerCase() === value.toLowerCase())) {
    throw new Error('Member already exists.');
  }
  return [...members, value];
}

export function removeMember(members, tasks, name) {
  return {
    members: members.filter((member) => member !== name),
    tasks: tasks.map((task) => (task.assignee === name ? { ...task, assignee: '' } : task)),
  };
}
