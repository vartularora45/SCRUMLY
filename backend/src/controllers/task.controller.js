import Task from "../models/Task.js";
import Team from "../models/Team.js";
import { syncStatusToJira, createJiraIssue } from "../services/jira.sync.js";
import {io} from "../server.js";
/**
 * Get tasks for a team
 * GET /api/tasks/:teamId
 */
export const getTeamTasks = async (req, res) => {
  try {
    const { teamId } = req.params;

    const tasks = await Task.find({ teamId, isArchived: false })
      .populate("assignee", "name email")
      .sort({ columnOrder: 1 });
    io.to(teamId).emit("tasksUpdated", tasks); // Real-time update to clients in the team room
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

/**
 * Create Task + Jira mein bhi issue banao (agar connected hai)
 * POST /api/tasks
 */
export const createTask = async (req, res) => {
  try {
    const {
      title, description, teamId, assignee,
      priority, status, confidence, aiGenerated,
      sourceMessage, jiraProjectKey, // ← frontend se project key bhejo
    } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Task DB mein banao
    const task = await Task.create({
      title, description, teamId, assignee,
      priority, status, confidence, aiGenerated,
      sourceMessage,
      statusHistory: [{ status: status || "TODO" }],
    });

    // Jira mein bhi issue create karo (background mein — await nahi)
    if (jiraProjectKey && req.user?._id) {
      createJiraIssue({
        userId:       req.user._id,
        projectKey:   jiraProjectKey,
        title,
        description,
        priority,
      }).then(async (jiraKey) => {
        if (jiraKey) {
          await Task.findByIdAndUpdate(task._id, {
            jiraIssueKey: jiraKey,
            jiraSynced:   true,
          });
        }
      }).catch(err => console.error('Jira create error:', err.message));
    }
    
    io.to(teamId).emit("tasksUpdated", task); // Real-time update to clients in the team room
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update Task (manual edit)
 * PUT /api/tasks/:id
 */
export const updateTask = async (req, res) => {
  try {
    const { title, description, assignee, priority } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (title)                task.title       = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined)    task.assignee    = assignee;
    if (priority)             task.priority    = priority;

    task.manuallyEdited = true;
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete Task (soft delete via archive)
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.isArchived = true;
    await task.save();
    io.to(task.teamId).emit("tasksUpdated", task); // Real-time update to clients in the team room
    res.json({ message: "Task archived successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Quick Status Update + Jira sync
 * PATCH /api/tasks/:id/status
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const { status, columnOrder } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (status) {
      task.status = status;
      task.statusHistory.push({ status });

      // Jira sync — agar task Jira se aaya hai ya jiraIssueKey hai
      if (task.jiraIssueKey && req.user?._id) {
        syncStatusToJira({
          userId:    req.user._id,
          issueKey:  task.jiraIssueKey,
          newStatus: status,
        }).catch(err => console.error('Jira status sync error:', err.message));
      }
    }

    if (columnOrder !== undefined) task.columnOrder = columnOrder;

    await task.save();
    io.to(task.teamId).emit("tasksUpdated", task); // Real-time update to clients in the team room
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Task Status History
 * GET /api/tasks/:id/history
 */
export const getTaskHistory = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    io.to(task.teamId).emit("taskHistoryRequested", task.statusHistory); // Real-time update to clients in the team room
    res.json(task.statusHistory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};