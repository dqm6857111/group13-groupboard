import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, emptyBoard, isValidBoard, loadBoard, saveBoard } from '../src/storage.js';
import { Status, createTask } from '../src/tasks.js';

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    dump: () => Object.fromEntries(map),
  };
}

const task = createTask(
  { title: 'Write report', assignee: 'Ye Yuting', dueDate: '2026-03-10' },
  { id: 't1', now: '2026-03-01T00:00:00.000Z' },
);

const validBoard = { version: 1, tasks: [task], members: ['Ye Yuting'] };

describe('isValidBoard', () => {
  it('accepts a valid v1 board', () => {
    expect(isValidBoard(validBoard)).toBe(true);
    expect(isValidBoard(emptyBoard())).toBe(true);
  });

  it('rejects wrong versions, missing arrays and invalid tasks', () => {
    expect(isValidBoard(null)).toBe(false);
    expect(isValidBoard({ version: 2, tasks: [], members: [] })).toBe(false);
    expect(isValidBoard({ version: 1, tasks: [], members: 'x' })).toBe(false);
    expect(isValidBoard({ version: 1, tasks: [], members: [''] })).toBe(false);
    expect(isValidBoard({ version: 1, tasks: [{ ...task, status: 'blocked' }], members: [] })).toBe(false);
    expect(isValidBoard({ version: 1, tasks: [{ ...task, dueDate: '2026-02-30' }], members: [] })).toBe(false);
    expect(isValidBoard({ version: 1, tasks: [{ ...task, title: ' ' }], members: [] })).toBe(false);
  });
});

describe('loadBoard', () => {
  it('returns an empty board when storage is empty', () => {
    const result = loadBoard(memoryStorage());
    expect(result.board).toEqual(emptyBoard());
    expect(result.warning).toBe('');
  });

  it('loads a saved board', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify(validBoard) });
    const result = loadBoard(storage);
    expect(result.board.tasks).toHaveLength(1);
    expect(result.board.tasks[0].status).toBe(Status.TODO);
    expect(result.board.members).toEqual(['Ye Yuting']);
  });

  it('falls back with a warning for corrupt JSON', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{not-json' });
    const result = loadBoard(storage);
    expect(result.board).toEqual(emptyBoard());
    expect(result.warning).toMatch(/invalid/i);
  });

  it('falls back for invalid schema or due dates', () => {
    const wrongVersion = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ version: 2, tasks: [], members: [] }) });
    expect(loadBoard(wrongVersion).board).toEqual(emptyBoard());
    const badDate = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({ version: 1, tasks: [{ ...task, dueDate: '2026-02-30' }], members: [] }),
    });
    expect(loadBoard(badDate).board).toEqual(emptyBoard());
  });

  it('handles unavailable or throwing storage', () => {
    expect(loadBoard(null).warning).toMatch(/unavailable/i);
    const throwing = {
      getItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadBoard(throwing).warning).toMatch(/could not be read/i);
  });
});

describe('saveBoard', () => {
  it('saves a board and can load it again', () => {
    const storage = memoryStorage();
    expect(saveBoard(validBoard, storage)).toEqual({ ok: true });
    const result = loadBoard(storage);
    expect(result.board.tasks).toHaveLength(1);
    expect(result.board.tasks[0].title).toBe('Write report');
  });

  it('reports unavailable and failed writes', () => {
    expect(saveBoard(validBoard, null).ok).toBe(false);
    const throwing = {
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(saveBoard(validBoard, throwing).ok).toBe(false);
  });
});
