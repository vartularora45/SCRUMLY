import Alert from '../models/Alert.js';
import Task from '../models/Task.js';

export const checkAndGenerateAlerts = async (teamId) => {
  const now = new Date();
  const tasks = await Task.find({ teamId, isArchived: false, status: { $ne: 'DONE' } }).populate('assignee');

  let blockedCount = 0;
  let overdueCount = 0;
  const inactiveDevs = new Set();
  const approachingDeadlineTasks = [];

  tasks.forEach(task => {
    if (task.status === 'BLOCKED') blockedCount++;
    
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const timeDiff = dueDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);

      if (hoursDiff < 0) overdueCount++;
      else if (hoursDiff < 48) approachingDeadlineTasks.push(task);
    }
  });

  // Generate Blocked Alert
  if (blockedCount >= 3) {
    await createAlertIfNotExist(teamId, 'TOO_MANY_BLOCKERS', `Warning: ${blockedCount} tasks are currently blocked.`, 'WARNING');
  }

  // Generate Overdue Alert
  if (overdueCount > 0) {
    await createAlertIfNotExist(teamId, 'OVERDUE_TASKS', `${overdueCount} tasks are overdue and need immediate attention.`, 'CRITICAL');
  }

  // Generate Deadline Alert
  if (approachingDeadlineTasks.length > 0) {
    await createAlertIfNotExist(teamId, 'DEADLINE_RISK', `${approachingDeadlineTasks.length} tasks are approaching their deadline within 48 hours.`, 'INFO');
  }
};

const createAlertIfNotExist = async (teamId, type, message, severity) => {
  const exists = await Alert.findOne({ teamId, type, isRead: false });
  if (!exists) {
    await Alert.create({ teamId, type, message, severity });
  }
};
