export const Status = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done'
};

// 定义状态流转矩阵
export function canTransition(from, to) {
  if (from === Status.TODO && to === Status.IN_PROGRESS) return true;
  if (from === Status.IN_PROGRESS && to === Status.DONE) return true;
  // 禁止从 To do 直接跳到 Done
  return false;
}