import Task from '../models/Task.js';
import Team from '../models/Team.js';

/* =========================================================
   HELPERS
========================================================= */

const isValidStatus = (status) =>
  ['TODO', 'IN_PROGRESS', 'DONE'].includes(status);

const calculateStats = (tasks) => {
  const grouped = {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  };

  let confidenceSum = 0;

  tasks.forEach(task => {
    grouped[task.status]++;
    confidenceSum += task.confidence || 0;
  });

  return {
    total: tasks.length,
    todo: grouped.TODO,
    inProgress: grouped.IN_PROGRESS,
    done: grouped.DONE,
    avgConfidence: tasks.length
      ? confidenceSum / tasks.length
      : 0,
  };
};

/* =========================================================
   GET BOARD
========================================================= */

export const getBoard = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { minConfidence = 0 } = req.query;

    // 🔐 Ensure user belongs to team
    const team = await Team.findOne({
      _id: teamId,
      'members.user': req.user.id,
    });

    if (!team) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this team',
      });
    }

    const tasks = await Task.find({
      teamId,
      confidence: { $gte: parseFloat(minConfidence) },
      isArchived: false,
    })
      .sort({ columnOrder: 1 })
      .populate('assignee', 'name email');

    const board = {
      TODO: tasks.filter(t => t.status === 'TODO'),
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
      DONE: tasks.filter(t => t.status === 'DONE'),
    };

    const stats = calculateStats(tasks);

    res.json({
      success: true,
      data: { board, stats },
    });

  } catch (error) {
    console.error('GET BOARD ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch board',
    });
  }
};



/* =========================================================
   UPDATE TASK
========================================================= */

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, title, assignee, columnOrder } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // 🔐 Check team access
    const team = await Team.findOne({
      _id: task.teamId,
      'members.user': req.user.id,
    });

    if (!team) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const updateFields = {};

    if (status) {
      if (!isValidStatus(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
        });
      }

      // 📜 Track status history
      if (task.status !== status) {
        updateFields.$push = {
          statusHistory: {
            status,
            changedAt: new Date(),
          }
        };
      }

      updateFields.status = status;
    }

    if (title) updateFields.title = title;
    if (assignee !== undefined) updateFields.assignee = assignee;
    if (columnOrder !== undefined) updateFields.columnOrder = columnOrder;

    updateFields.manuallyEdited = true;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email')
      .populate('sourceMessage', 'content');

    res.json({
      success: true,
      data: updatedTask,
    });

  } catch (error) {
    console.error('UPDATE TASK ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Task update failed',
    });
  }
};



/* =========================================================
   SOFT DELETE TASK
========================================================= */

export const deleteTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const team = await Team.findOne({
      _id: task.teamId,
      'members.user': req.user.id,
    });

    if (!team) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    task.isArchived = true;
    await task.save();

    res.json({
      success: true,
      message: 'Task archived',
    });

  } catch (error) {
    console.error('DELETE TASK ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed',
    });
  }
};



/* =========================================================
   CREATE MANUAL TASK
========================================================= */

export const createManualTask = async (req, res) => {
  try {
    const { title, description, status, teamId, assignee } = req.body;

    if (!title || !teamId) {
      return res.status(400).json({
        success: false,
        message: 'Title & teamId required',
      });
    }

    if (status && !isValidStatus(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const team = await Team.findOne({
      _id: teamId,
      'members.user': req.user.id,
    });

    if (!team) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized team access',
      });
    }

    const lastTask = await Task.findOne({ teamId })
      .sort({ columnOrder: -1 });

    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'TODO',
      teamId,
      assignee: assignee || null,
      aiGenerated: false,
      confidence: 1,
      columnOrder: lastTask ? lastTask.columnOrder + 1 : 0,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTask,
    });

  } catch (error) {
    console.error('CREATE TASK ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Task creation failed',
    });
  }
};
