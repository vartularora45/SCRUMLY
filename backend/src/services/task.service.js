import Task from '../models/Task.js';
import Message from '../models/Message.js';

export const createTaskFromMessage = async (messageId, aiData, teamId) => {
  try {
    const task = await Task.create({
      title: aiData.task,
      status: aiData.status,
      confidence: aiData.confidence,
      teamId,
      sourceMessage: messageId,
      aiGenerated: true,
    });

    // Link task back to message
    await Message.findByIdAndUpdate(messageId, {
      generatedTask: task._id,
      aiProcessed: true,
    });

    return task;
  } catch (error) {
    throw new Error(`Task creation failed: ${error.message}`);
  }
};

export const updateTaskStatus = async (taskId, newStatus, userId) => {
  try {
    const task = await Task.findByIdAndUpdate(
      taskId,
      { 
        status: newStatus,
        manuallyEdited: true,
      },
      { new: true }
    );

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  } catch (error) {
    throw new Error(`Task update failed: ${error.message}`);
  }
};

export const getTasksByTeam = async (teamId, filters = {}) => {
  try {
    const query = { teamId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.minConfidence) {
      query.confidence = { $gte: filters.minConfidence };
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email')
      .populate('sourceMessage', 'content author createdAt')
      .sort({ createdAt: -1 });

    return tasks;
  } catch (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }
};

export const deleteTask = async (taskId, userId) => {
  try {
    const task = await Task.findByIdAndDelete(taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    // Unlink from message
    if (task.sourceMessage) {
      await Message.findByIdAndUpdate(task.sourceMessage, {
        generatedTask: null,
      });
    }

    return task;
  } catch (error) {
    throw new Error(`Task deletion failed: ${error.message}`);
  }
};
