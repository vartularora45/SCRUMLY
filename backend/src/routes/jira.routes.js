import express from "express";
import { jiraCallback,connectToJira } from "../controllers/jira.controller.js";

const router = express.Router();

router.get("/callback", jiraCallback);
router.get("/connect", connectToJira);
export default router;
