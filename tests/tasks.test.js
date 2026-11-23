import { describe, expect, it } from 'vitest';
import {
  Status,
  addMember,
  canTransition,
  classifyDueDate,
  countByStatus,
  createTask,
  deleteTask,
  moveTask,
  removeMember,
  updateTask,
  validateDueDate,
  validateTitle,
} from '../src/tasks.js';

const makeTask = (overrides = {}) =>
  createTask(
    { title: 'Write report', assignee: '', dueDate: '', ...overrides },
    { id: overrides.id || 't1', now: '2026-03-01T00:00:00.000Z' },
  );

describe('transitions', () => {
  it('allows the forward and backward paths in the matrix', () => {
    expect(canTransition(Status.TODO, Status.IN_PROGRESS)).toBe(true);
    expect(canTransition(Status.IN_PROGRESS, Status.TODO)).toBe(true);
    expect(canTransition(Status.IN_PROGRESS, Status.DONE)).toBe(true);
    expect(canTransition(Status.DONE, Status.IN_PROGRESS)).toBe(true);
  });

  it('rejects direct To do -> Done and self/unknown transitions', () => {
    expect(canTransition(Status.TODO, Status.DONE)).toBe(false);
    expect(canTransition(Status.TODO, Status.TODO)).toBe(false);
    expect(canTransition(Status.DONE, Status.TODO)).toBe(false);
    expect(canTransition('unknown', Status.TODO)).toBe(false);
  });
});

describe('task validation and creation', () => {
  it('trims the title and starts in To do', () => {
    const task = makeTask({ title: '  Draft outline  ' });
    expect(task.title).toBe('Draft outline');
    expect(task.status).toBe(Status.TODO);
    expect(task.id).toBe('t1');
  });

  it('rejects blank, non-string and overlong titles', () => {
    expect(validateTitle('')).toBe('Title is required.');
    expect(validateTitle('   ')).toBe('Title is required.');
    expect(validateTitle(null)).toBe('Title is required.');
    expect(validateTitle('x'.repeat(121))).toBe('Title must be 120 characters or fewer.');
    expect(() => makeTask({ title: '   ' })).toThrow('Title is required.');
  });

  it('validates optional due dates and rejects impossible dates', () => {
    expect(validateDueDate('')).toBe('');
    expect(validateDueDate('2026-03-10')).toBe('');
    expect(validateDueDate('2026-3-10')).not.toBe('');
    expect(validateDueDate('2026-02-30')).not.toBe('');
    expect(() => makeTask({ dueDate: '2026-02-30' })).toThrow('Due date is invalid.');
  });
});

describe('task CRUD', () => {
  it('updates title, assignee and due date without mutating the input', () => {
    const tasks = [makeTask()];
    const next = updateTask(tasks, 't1', {
      title: '  Final report ',
      assignee: 'Ye Yuting',
      dueDate: '2026-03-10',
    });
    expect(next[0]).toMatchObject({
      title: 'Final report',
      assignee: 'Ye Yuting',
      dueDate: '2026-03-10',
    });
    expect(tasks[0].title).toBe('Write report');
    expect(next).not.toBe(tasks);
  });

  it('leaves other tasks untouched and ignores unknown ids', () => {
    const tasks = [makeTask(), makeTask({ id: 't2', title: 'Second' })];
    const next = updateTask(tasks, 'missing', { title: 'No change' });
    expect(next).toEqual(tasks);
  });

  it('rejects invalid updates', () => {
    const tasks = [makeTask()];
    expect(() => updateTask(tasks, 't1', { title: '   ' })).toThrow('Title is required.');
    expect(() => updateTask(tasks, 't1', { dueDate: '2026-02-30' })).toThrow('Due date is invalid.');
  });

  it('deletes a task by id', () => {
    const tasks = [makeTask(), makeTask({ id: 't2', title: 'Second' })];
    expect(deleteTask(tasks, 't1')).toHaveLength(1);
    expect(deleteTask(tasks, 't1')[0].id).toBe('t2');
    expect(deleteTask(tasks, 'missing')).toHaveLength(2);
  });
});

describe('moving tasks', () => {
  it('moves forward, backward and reopens', () => {
    let tasks = [makeTask()];
    tasks = moveTask(tasks, 't1', Status.IN_PROGRESS);
    expect(tasks[0].status).toBe(Status.IN_PROGRESS);
    tasks = moveTask(tasks, 't1', Status.TODO);
    expect(tasks[0].status).toBe(Status.TODO);
    tasks = moveTask(tasks, 't1', Status.IN_PROGRESS);
    tasks = moveTask(tasks, 't1', Status.DONE);
    expect(tasks[0].status).toBe(Status.DONE);
    tasks = moveTask(tasks, 't1', Status.IN_PROGRESS);
    expect(tasks[0].status).toBe(Status.IN_PROGRESS);
  });

  it('rejects illegal transitions and unknown statuses', () => {
    const tasks = [makeTask()];
    expect(() => moveTask(tasks, 't1', Status.DONE)).toThrow('Illegal transition');
    expect(() => moveTask(tasks, 't1', 'blocked')).toThrow('Unknown status');
    expect(moveTask(tasks, 'missing', Status.IN_PROGRESS)).toEqual(tasks);
  });
});

describe('counts and due-date classification', () => {
  it('counts tasks by status', () => {
    const tasks = [
      makeTask({ id: 'a' }),
      makeTask({ id: 'b' }),
      { ...makeTask({ id: 'c' }), status: Status.IN_PROGRESS },
      { ...makeTask({ id: 'd' }), status: Status.DONE },
    ];
    expect(countByStatus(tasks)).toEqual({
      todo: 2,
      'in-progress': 1,
      done: 1,
    });
  });

  it('classifies overdue, due-soon, normal and no date', () => {
    expect(classifyDueDate('', '2026-03-10')).toBe('none');
    expect(classifyDueDate('2026-03-09', '2026-03-10')).toBe('overdue');
    expect(classifyDueDate('2026-03-10', '2026-03-10')).toBe('due-soon');
    expect(classifyDueDate('2026-03-12', '2026-03-10')).toBe('due-soon');
    expect(classifyDueDate('2026-03-13', '2026-03-10')).toBe('normal');
    expect(classifyDueDate('2026-02-30', '2026-03-10')).toBe('invalid');
    expect(classifyDueDate('2026-03-10', 'not-a-date')).toBe('invalid');
  });
});

describe('members', () => {
  it('adds, trims and rejects duplicate or blank members', () => {
    const members = addMember([], '  Du Qimeng ');
    expect(members).toEqual(['Du Qimeng']);
    expect(() => addMember(members, 'du qimeng')).toThrow('Member already exists.');
    expect(() => addMember(members, '  ')).toThrow('Member name is required.');
  });

  it('removes a member and unassigns their tasks', () => {
    const members = ['Du Qimeng', 'Ye Yuting'];
    const tasks = [
      makeTask({ id: 'a', assignee: 'Du Qimeng' }),
      makeTask({ id: 'b', assignee: 'Ye Yuting' }),
    ];
    const next = removeMember(members, tasks, 'Du Qimeng');
    expect(next.members).toEqual(['Ye Yuting']);
    expect(next.tasks[0].assignee).toBe('');
    expect(next.tasks[1].assignee).toBe('Ye Yuting');
  });
});
