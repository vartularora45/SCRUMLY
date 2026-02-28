import express from "express";
import {
  getTeamTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskHistory,
} from "../controllers/task.controller.js";

import {protect} from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔐 Protect all task routes
router.use(protect);


// Get tasks for a specific team
router.get("/:teamId", getTeamTasks);

// Create new task
router.post("/", createTask);

// Update task (manual edit)
router.put("/:id", updateTask);

// Soft delete (archive)
router.delete("/:id", deleteTask);

// Quick status / board update
router.patch("/:id/status", updateTaskStatus);

// Task status history
router.get("/:id/history", getTaskHistory);

export default router;
