import express from "express";
import {
  createTeam,
  getUserTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
} from "../controllers/team.controller.js";

import {protect} from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔐 All routes protected
router.use(protect);

/**
 * TEAM ROUTES
 */

// Create team
router.post("/", createTeam);

// Get logged-in user's teams
router.get("/", getUserTeams);

// Get team details
router.get("/:id", getTeamById);

// Update team
router.put("/:id", updateTeam);

// Delete team
router.delete("/:id", deleteTeam);

// Add member
router.post("/:id/members", addMember);

// Remove member
router.delete("/:id/members/:uid", removeMember);

export default router;
