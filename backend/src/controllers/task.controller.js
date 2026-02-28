import Task from "../models/Task.js";
import Team from "../models/Team.js";

/**
 * Get tasks for a team
 * GET /api/tasks/:teamId
 */
export const getTeamTasks = async (req, res) => {
  try {
    const { teamId } = req.params;

    const tasks = await Task.find({
      teamId,
      isArchived: false,
    })
      .populate("assignee", "name email")
      .sort({ columnOrder: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create Task
 * POST /api/tasks
 */
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      teamId,
      assignee,
      priority,
      status,
      confidence,
      aiGenerated,
      sourceMessage,
    } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const task = await Task.create({
      title,
      description,
      teamId,
      assignee,
      priority,
      status,
      confidence,
      aiGenerated,
      sourceMessage,
      statusHistory: [
        { status: status || "TODO" }
      ],
    });

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

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined) task.assignee = assignee;
    if (priority) task.priority = priority;

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

    res.json({ message: "Task archived successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Quick Status Update
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
    }

    if (columnOrder !== undefined) {
      task.columnOrder = columnOrder;
    }

    await task.save();

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

    res.json(task.statusHistory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
