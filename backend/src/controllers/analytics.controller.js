import mongoose from "mongoose";
import Task from "../models/Task.js";

const { ObjectId } = mongoose.Types;

/**
 * Team Velocity
 * GET /api/analytics/:teamId/velocity
 *
 * Returns tasks completed in last 7 days
 */
export const getVelocity = async (req, res) => {
  try {
    const { teamId } = req.params;

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const completedTasks = await Task.countDocuments({
      teamId,
      status: "DONE",
      completedAt: { $gte: lastWeek },
      isArchived: false,
    });

    res.json({
      velocityLast7Days: completedTasks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Completion Rate
 * GET /api/analytics/:teamId/completion
 */
export const getCompletionRate = async (req, res) => {
  try {
    const { teamId } = req.params;

    const total = await Task.countDocuments({
      teamId,
      isArchived: false,
    });

    const done = await Task.countDocuments({
      teamId,
      status: "DONE",
      isArchived: false,
    });

    const rate = total === 0 ? 0 : done / total;

    res.json({
      totalTasks: total,
      completedTasks: done,
      completionRate: rate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Member Stats
 * GET /api/analytics/:teamId/member-stats
 */
export const getMemberStats = async (req, res) => {
  try {
    const { teamId } = req.params;

    const stats = await Task.aggregate([
      {
        $match: {
          teamId: new ObjectId(teamId),
          isArchived: false,
        },
      },
      {
        $group: {
          _id: "$assignee",
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [{ $eq: ["$status", "DONE"] }, 1, 0],
            },
          },
          inProgressTasks: {
            $sum: {
              $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0],
            },
          },
          todoTasks: {
            $sum: {
              $cond: [{ $eq: ["$status", "TODO"] }, 1, 0],
            },
          },
          avgConfidence: { $avg: "$confidence" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          totalTasks: 1,
          completedTasks: 1,
          inProgressTasks: 1,
          todoTasks: 1,
          avgConfidence: { $round: ["$avgConfidence", 2] },
        },
      },
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
