import Message from '../models/Message.js';
import Task from '../models/Task.js';
import Team from '../models/Team.js';
import { parseMessageWithAI } from '../services/ai.service.js';
import { createTaskFromMessage } from '../services/task.service.js';
import { io } from '../server.js'; // ✅ Socket.IO import

/* =========================================================
   CREATE MESSAGE + AI PROCESSING
========================================================= */

export const createMessage = async (req, res) => {
  try {
    const { content, teamId } = req.body;

    if (!content || !teamId) {
      return res.status(400).json({
        success: false,
        message: 'Content & teamId required',
      });
    }

    // 🔐 Validate team membership
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

    // 📝 Save message
    const message = await Message.create({
      content,
      teamId,
      author: req.user.id,
      aiAttempts: 0,
    });

    let aiResult = null;
    let task = null;

    try {
      aiResult = await parseMessageWithAI(
        content,
        team.settings.aiModel
      );

      message.aiAttempts += 1;
      message.aiProcessed = true;

      message.aiResultSnapshot = {
        task: aiResult.task,
        status: aiResult.status,
        confidence: aiResult.confidence,
        success: aiResult.success,
      };

      if (
        team.settings.autoCreateTasks &&
        aiResult.confidence >= team.settings.confidenceThreshold
      ) {
        task = await createTaskFromMessage(
          message._id,
          aiResult,
          teamId
        );

        message.generatedTask = task._id;
      }

      await message.save();

    } catch (aiError) {
      console.error('AI PROCESSING ERROR:', aiError);
      message.aiAttempts += 1;
      message.rawAIResponse = aiError.message;
      await message.save();
    }

    const populatedMessage = await Message.findById(message._id)
      .populate('author', 'name email')
      .populate('generatedTask');

    // ✅ Socket.IO — broadcast to all team members except sender
    io.to(teamId).emit('new_message', populatedMessage);

    res.status(201).json({
      success: true,
      data: {
        message: populatedMessage,
        aiResult,
        task,
      },
    });

  } catch (error) {
    console.error('CREATE MESSAGE ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Message creation failed',
    });
  }
};

/* =========================================================
   GET TEAM MESSAGES (PAGINATED)
========================================================= */

export const getMessages = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    // 🔐 Validate team access
    const team = await Team.findOne({
      _id: teamId,
      'members.user': req.user.id,
    });

    if (!team) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const parsedLimit = Math.min(parseInt(limit), 100);
    const skip = (parseInt(page) - 1) * parsedLimit;

    const [messages, total] = await Promise.all([
      Message.find({
        teamId,
        isDeleted: { $ne: true },
      })
        .populate('author', 'name email')
        .populate('generatedTask', 'title status confidence')
        .sort({ createdAt: -1 })
        .limit(parsedLimit)
        .skip(skip),
      Message.countDocuments({
        teamId,
        isDeleted: { $ne: true },
      })
    ]);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parsedLimit),
          limit: parsedLimit,
          hasMore: total > skip + messages.length,
        },
      },
    });

  } catch (error) {
    console.error('GET MESSAGES ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
    });
  }
};

/* =========================================================
   SOFT DELETE MESSAGE
========================================================= */

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // 🔐 Check ownership
    if (message.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete others messages',
      });
    }

    const teamId = message.teamId.toString();

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = '[deleted]';
    await message.save();

    // ✅ Socket.IO — broadcast deletion to all team members
    io.to(teamId).emit('message_deleted', req.params.id);

    res.json({
      success: true,
      message: 'Message deleted',
    });

  } catch (error) {
    console.error('DELETE MESSAGE ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed',
    });
  }
};