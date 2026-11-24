import {
  Status,
  STATUSES,
  STATUS_LABELS,
  addMember,
  classifyDueDate,
  countByStatus,
  createTask,
  deleteTask,
  moveTask,
  removeMember,
  updateTask,
} from './tasks.js';
import { loadBoard, saveBoard } from './storage.js';
import { todayIso } from './clock.js';

const $ = (selector) => document.querySelector(selector);

const els = {
  board: $('#board'),
  banner: $('#banner'),
  form: $('#task-form'),
  formTitle: $('#form-title'),
  title: $('#task-title'),
  assignee: $('#task-assignee'),
  due: $('#task-due'),
  submit: $('#task-submit'),
  cancel: $('#task-cancel'),
  memberForm: $('#member-form'),
  memberName: $('#member-name'),
  memberList: $('#member-list'),
};

const FEATURES = { iteration2: true };

const loaded = loadBoard();
let board = loaded.board;
let editingId = null;
let bannerTimer = null;

function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function showBanner(message, type = 'info') {
  if (!message) return;
  els.banner.textContent = message;
  els.banner.className = `banner ${type}`;
  els.banner.hidden = false;
  window.clearTimeout(bannerTimer);
  bannerTimer = window.setTimeout(() => {
    els.banner.hidden = true;
  }, 5000);
}

function persist() {
  const result = saveBoard(board);
  if (!result.ok) showBanner(result.error, 'error');
  return result.ok;
}

function renderAssigneeOptions() {
  const current = els.assignee.value;
  els.assignee.replaceChildren(new Option('Unassigned', ''));
  for (const member of board.members) {
    els.assignee.append(new Option(member, member));
  }
  if ([...els.assignee.options].some((option) => option.value === current)) {
    els.assignee.value = current;
  }
}

function renderMembers() {
  els.memberList.replaceChildren();
  if (!board.members.length) {
    els.memberList.append(el('li', 'muted', 'No members yet.'));
    return;
  }
  for (const member of board.members) {
    const item = el('li', 'member-item');
    item.append(el('span', 'member-name', member));
    const remove = el('button', 'btn small danger', 'Remove');
    remove.type = 'button';
    remove.dataset.member = member;
    item.append(remove);
    els.memberList.append(item);
  }
}

function actionButton(label, action, taskId, className = '') {
  const button = el('button', `btn small ${className}`.trim(), label);
  button.type = 'button';
  button.dataset.action = action;
  button.dataset.id = taskId;
  return button;
}

function renderTask(task, today) {
  const card = el('article', 'card');
  card.dataset.id = task.id;
  card.append(el('h3', 'card-title', task.title));

  if (FEATURES.iteration2) {
    const meta = el('div', 'card-meta');
    meta.append(el('span', 'assignee', task.assignee ? `Assignee: ${task.assignee}` : 'Unassigned'));
    const dueClass = classifyDueDate(task.dueDate, today);
    const due = el('span', `due ${dueClass}`, task.dueDate ? `Due ${task.dueDate}` : 'No due date');
    meta.append(due);
    card.append(meta);
  }

  const actions = el('div', 'card-actions');
  if (task.status === Status.TODO) {
    actions.append(actionButton('Start', 'start', task.id, 'primary'));
  }
  if (task.status === Status.IN_PROGRESS) {
    actions.append(actionButton('Back to To do', 'back', task.id));
    actions.append(actionButton('Complete', 'complete', task.id, 'primary'));
  }
  if (task.status === Status.DONE) {
    actions.append(actionButton('Reopen', 'reopen', task.id, 'primary'));
  }
  actions.append(actionButton('Edit', 'edit', task.id));
  actions.append(actionButton('Delete', 'delete', task.id, 'danger'));
  card.append(actions);
  return card;
}

function renderBoard() {
  els.board.replaceChildren();
  const counts = countByStatus(board.tasks);
  const today = todayIso();

  for (const status of STATUSES) {
    const column = el('section', `column column-${status}`);
    const header = el('div', 'column-header');
    header.append(el('h2', 'column-title', STATUS_LABELS[status]));
    header.append(el('span', 'count', String(counts[status] || 0)));
    column.append(header);

    const list = el('div', 'card-list');
    const tasks = board.tasks.filter((task) => task.status === status);
    if (!tasks.length) {
      list.append(el('p', 'empty', 'No tasks here.'));
    } else {
      for (const task of tasks) list.append(renderTask(task, today));
    }
    column.append(list);
    els.board.append(column);
  }
}

function renderAll() {
  renderAssigneeOptions();
  renderMembers();
  renderBoard();
}

function resetForm() {
  editingId = null;
  els.form.reset();
  els.assignee.value = '';
  els.formTitle.textContent = 'Add a task';
  els.submit.textContent = 'Add task';
  els.cancel.hidden = true;
}

function startEdit(task) {
  editingId = task.id;
  els.title.value = task.title;
  els.assignee.value = task.assignee;
  els.due.value = task.dueDate;
  els.formTitle.textContent = 'Edit task';
  els.submit.textContent = 'Save changes';
  els.cancel.hidden = false;
  els.title.focus();
}

els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = {
    title: els.title.value,
    assignee: els.assignee.value,
    dueDate: els.due.value,
  };
  const wasEditing = Boolean(editingId);
  try {
    if (editingId) {
      board.tasks = updateTask(board.tasks, editingId, data);
    } else {
      board.tasks = [...board.tasks, createTask(data)];
    }
    if (persist()) {
      renderBoard();
      resetForm();
      showBanner(wasEditing ? 'Task updated.' : 'Task added.', 'success');
    }
  } catch (error) {
    showBanner(error.message, 'error');
  }
});

els.cancel.addEventListener('click', resetForm);

els.memberForm.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    board.members = addMember(board.members, els.memberName.value);
    if (persist()) {
      els.memberForm.reset();
      renderAll();
      showBanner('Member added.', 'success');
    }
  } catch (error) {
    showBanner(error.message, 'error');
  }
});

els.memberList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-member]');
  if (!button) return;
  const name = button.dataset.member;
  if (!window.confirm(`Remove ${name}? Their tasks will become unassigned.`)) return;
  const next = removeMember(board.members, board.tasks, name);
  board.members = next.members;
  board.tasks = next.tasks;
  if (persist()) {
    renderAll();
    showBanner('Member removed.', 'success');
  }
});

els.board.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const taskId = button.dataset.id;
  const action = button.dataset.action;
  const task = board.tasks.find((item) => item.id === taskId);
  if (!task) return;

  try {
    if (action === 'edit') {
      startEdit(task);
      return;
    }
    if (action === 'delete') {
      if (!window.confirm(`Delete “${task.title}”?`)) return;
      board.tasks = deleteTask(board.tasks, taskId);
      if (persist()) {
        renderBoard();
        showBanner('Task deleted.', 'success');
      }
      return;
    }

    const target = {
      start: Status.IN_PROGRESS,
      complete: Status.DONE,
      back: Status.TODO,
      reopen: Status.IN_PROGRESS,
    }[action];
    if (!target) return;
    board.tasks = moveTask(board.tasks, taskId, target);
    if (persist()) {
      renderBoard();
      showBanner(`Task moved to ${STATUS_LABELS[target]}.`, 'success');
    }
  } catch (error) {
    showBanner(error.message, 'error');
  }
});

if (!FEATURES.iteration2) {
  document.querySelectorAll('[data-feature="i2"]').forEach((node) => {
    node.hidden = true;
  });
}

renderAll();
if (loaded.warning) showBanner(loaded.warning, 'warn');
