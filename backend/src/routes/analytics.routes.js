import express from "express";
import {
  getVelocity,
  getCompletionRate,
  getMemberStats,
} from "../controllers/analytics.controller.js";

import {protect} from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔐 Protect all analytics routes
router.use(protect);

/**
 * ANALYTICS ROUTES
 */

// Team velocity
router.get("/:teamId/velocity", getVelocity);

// Completion rate
router.get("/:teamId/completion", getCompletionRate);

// Per-member stats
router.get("/:teamId/member-stats", getMemberStats);

export default router;
