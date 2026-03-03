import Team from "../models/Team.js";
import User from "../models/User.js";
import JiraIntegration from "../models/jiraintegration.js";
import axios from "axios";

// ─── Helper: Jira mein project create karo ────────────────────────────────────
const createJiraProject = async (userId, teamName) => {
  try {
    const integration = await JiraIntegration.findOne({ userId });
    if (!integration) return null; // Jira connected nahi hai — silently skip

    const api = axios.create({
      headers: {
        Authorization: `Bearer ${integration.accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    // Project key banao — naam se (e.g. "My Team" → "MYTEAM")
    const rawKey = teamName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);
    const projectKey = rawKey || "PROJ";

    // Jira mein Scrum project create karo
    const res = await api.post(
      `https://api.atlassian.com/ex/jira/${integration.cloudId}/rest/api/3/project`,
      {
        key:          projectKey,
        name:         teamName,
        projectTypeKey: "software",
        description:  `Project created from Scrumly for team: ${teamName}`,
        leadAccountId: integration.jiraAccountId,
      }
    );

    console.log(`✅ Jira project created: ${res.data.key} for team: ${teamName}`);

    // Integration ke projects list mein bhi add karo
    await JiraIntegration.findOneAndUpdate(
      { userId },
      {
        $push: {
          projects: {
            id:  res.data.id,
            key: res.data.key,
            name: teamName,
            avatarUrl: "",
          },
        },
      }
    );

    return res.data.key; // e.g. "MYTEAM"
  } catch (err) {
    // Project key conflict hoga toh retry with timestamp
    if (err.response?.status === 400) {
      try {
        const integration = await JiraIntegration.findOne({ userId });
        const api = axios.create({
          headers: {
            Authorization: `Bearer ${integration.accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        const fallbackKey = teamName
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 7) + Date.now().toString().slice(-3);

        const res = await api.post(
          `https://api.atlassian.com/ex/jira/${integration.cloudId}/rest/api/3/project`,
          {
            key:            fallbackKey,
            name:           teamName,
            projectTypeKey: "software",
            leadAccountId:  integration.jiraAccountId,
          }
        );

        console.log(`✅ Jira project created (fallback key): ${res.data.key}`);
        return res.data.key;
      } catch (retryErr) {
        console.error("❌ Jira project create retry failed:", retryErr.response?.data || retryErr.message);
        return null;
      }
    }
    console.error("❌ Jira project create failed:", err.response?.data || err.message);
    return null;
  }
};

// ─── Create Team ──────────────────────────────────────────────────────────────
export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      owner: req.user.id,
      members: [{ user: req.user.id, role: "OWNER" }],
    });

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { teams: team._id },
    });

    // ── Jira mein bhi project banao (background mein) ──
    createJiraProject(req.user.id, name).then((jiraKey) => {
      if (jiraKey) console.log(`🔗 Team "${name}" linked to Jira project: ${jiraKey}`);
    });

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Get User Teams ───────────────────────────────────────────────────────────
export const getUserTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      "members.user": req.user.id,
    }).populate("members.user", "name email");

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Get Team By ID ───────────────────────────────────────────────────────────
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("members.user", "name email");

    if (!team) return res.status(404).json({ message: "Team not found" });

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Update Team ──────────────────────────────────────────────────────────────
export const updateTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Only owner can update team" });

    if (name) team.name = name;
    if (description !== undefined) team.description = description;

    await team.save();
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Delete Team ──────────────────────────────────────────────────────────────
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Only owner can delete team" });

    await User.updateMany(
      { teams: team._id },
      { $pull: { teams: team._id } }
    );

    await team.deleteOne();
    res.json({ message: "Team deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Add Member ───────────────────────────────────────────────────────────────
export const addMember = async (req, res) => {
  try {
    const { userId, email, role = "MEMBER" } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Only owner can add members" });

    let userToAdd = null;
    if (userId) {
      userToAdd = await User.findById(userId);
    } else if (email) {
      userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!userToAdd)
      return res.status(404).json({ message: "User not found. Check the email and try again." });

    const alreadyMember = team.members.some(
      (member) => member.user.toString() === userToAdd._id.toString()
    );

    if (alreadyMember)
      return res.status(400).json({ message: "User is already a member" });

    team.members.push({ user: userToAdd._id, role });
    await team.save();

    await User.findByIdAndUpdate(userToAdd._id, {
      $addToSet: { teams: team._id },
    });

    const populated = await Team.findById(team._id)
      .populate("members.user", "name email")
      .populate("owner", "name email");

    res.json({ team: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Remove Member ────────────────────────────────────────────────────────────
export const removeMember = async (req, res) => {
  try {
    const { id, uid } = req.params;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Only owner can remove members" });

    if (uid === team.owner.toString())
      return res.status(400).json({ message: "Owner cannot be removed" });

    team.members = team.members.filter(
      (member) => member.user.toString() !== uid
    );

    await team.save();

    await User.findByIdAndUpdate(uid, {
      $pull: { teams: team._id },
    });

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};