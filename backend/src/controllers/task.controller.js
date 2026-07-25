import Task from "../models/Task.js";
import Team from "../models/Team.js";
import { syncStatusToJira, createJiraIssue } from "../services/jira.sync.js";
import { io } from "../server.js";

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

    // FIX: Removed socket emit on GET — was causing cascading re-renders
    // on all connected clients every time any user fetched tasks
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Create Task + create Jira issue if connected
 * POST /api/tasks
 */
export const createTask = async (req, res) => {
  try {
    const {
      title, description, teamId, assignee,
      priority, status, confidence, aiGenerated,
      sourceMessage, jiraProjectKey,
    } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const task = await Task.create({
      title, description, teamId, assignee,
      priority, status, confidence, aiGenerated,
      sourceMessage,
      statusHistory: [{ status: status || "TODO" }],
    });

    // Broadcast only the newly created task instead of fetching all tasks
    const populatedTask = await Task.findById(task._id).populate("assignee", "name email");
    io.to(teamId).emit("taskCreated", populatedTask);

    // Create Jira issue in background if connected
    if (jiraProjectKey && req.user?._id) {
      createJiraIssue({
        userId:     req.user._id,
        projectKey: jiraProjectKey,
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
      }).catch((err) => console.error('Jira create error:', err.message));
    }

    res.status(201).json({ success: true, data: task, message: 'Task created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (title)                     task.title       = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined)    task.assignee    = assignee;
    if (priority)                  task.priority    = priority;

    task.manuallyEdited = true;
    await task.save();

    // Broadcast the updated single task
    const populated = await Task.findById(task._id).populate("assignee", "name email");
    io.to(task.teamId.toString()).emit("taskStatusUpdated", populated);

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Delete Task (soft delete via archive)
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    task.isArchived = true;
    await task.save();

    // Broadcast only the deleted task's ID
    io.to(task.teamId.toString()).emit("taskDeleted", task._id);

    res.json({ success: true, message: "Task archived successfully", data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (status) {
      task.status = status;
      task.statusHistory.push({ status });

      // Sync to Jira if this task has a Jira issue key
      if (task.jiraIssueKey && req.user?._id) {
        syncStatusToJira({
          userId:    req.user._id,
          issueKey:  task.jiraIssueKey,
          newStatus: status,
        }).catch((err) => console.error('Jira status sync error:', err.message));
      }
    }

    if (columnOrder !== undefined) task.columnOrder = columnOrder;

    await task.save();

    // Broadcast the updated single task (not full list — more efficient)
    const populated = await Task.findById(task._id).populate("assignee", "name email");
    io.to(task.teamId.toString()).emit("taskStatusUpdated", populated);

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Task Status History
 * GET /api/tasks/:id/history
 */
export const getTaskHistory = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, data: task.statusHistory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};