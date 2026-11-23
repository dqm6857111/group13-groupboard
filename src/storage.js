import { STATUSES, validateDueDate } from './tasks.js';

export const STORAGE_KEY = 'groupboard:v1';

export function emptyBoard() {
  return { version: 1, tasks: [], members: [] };
}

export function isValidBoard(value) {
  if (!value || typeof value !== 'object') return false;
  if (value.version !== 1) return false;
  if (!Array.isArray(value.tasks) || !Array.isArray(value.members)) return false;
  if (!value.members.every((member) => typeof member === 'string' && member.trim())) {
    return false;
  }
  return value.tasks.every((task) => {
    if (!task || typeof task !== 'object') return false;
    if (typeof task.id !== 'string' || !task.id) return false;
    if (typeof task.title !== 'string' || !task.title.trim()) return false;
    if (!STATUSES.includes(task.status)) return false;
    if (typeof task.assignee !== 'string') return false;
    if (typeof task.dueDate !== 'string') return false;
    if (task.dueDate && validateDueDate(task.dueDate)) return false;
    return true;
  });
}

export function loadBoard(storage = globalThis.localStorage) {
  if (!storage) {
    return { board: emptyBoard(), warning: 'Browser storage is unavailable; changes will not persist.' };
  }
  let raw;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { board: emptyBoard(), warning: 'Saved data could not be read; starting with an empty board.' };
  }
  if (!raw) return { board: emptyBoard(), warning: '' };
  try {
    const parsed = JSON.parse(raw);
    if (!isValidBoard(parsed)) throw new Error('Invalid board schema');
    return { board: { version: 1, tasks: parsed.tasks, members: parsed.members }, warning: '' };
  } catch {
    return { board: emptyBoard(), warning: 'Saved data was invalid; starting with an empty board.' };
  }
}

export function saveBoard(board, storage = globalThis.localStorage) {
  if (!storage) return { ok: false, error: 'Browser storage is unavailable.' };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(board));
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not save the board. Storage may be full.' };
  }
}
