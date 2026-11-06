import { describe, it, expect } from 'vitest';
import { canTransition, Status } from '../src/tasks.js';

describe('Task Status Transitions', () => {
  it('AC1 & AC3: should allow To do -> In progress', () => {
    expect(canTransition(Status.TODO, Status.IN_PROGRESS)).toBe(true);
  });

  it('AC3: should reject direct To do -> Done', () => {
    expect(canTransition(Status.TODO, Status.DONE)).toBe(false);
  });
});