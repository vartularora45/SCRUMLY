import Team from "../models/Team.js";
import User from "../models/User.js";


export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      owner: req.user.id,
      members: [
        { user: req.user.id, role: "OWNER" }
      ],
    });

   
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { teams: team._id },
    });

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


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

export const addMember = async (req, res) => {
  try {
    const { userId, email, role = "MEMBER" } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Only owner can add members" });

    // ✅ Accept either userId OR email
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

    // ✅ Add to team
    team.members.push({ user: userToAdd._id, role });
    await team.save();

    // 🔥 Sync user → teams
    await User.findByIdAndUpdate(userToAdd._id, {
      $addToSet: { teams: team._id },
    });

    // Return populated team so frontend can update UI directly
    const populated = await Team.findById(team._id)
      .populate("members.user", "name email")
      .populate("owner", "name email");

    res.json({ team: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const removeMember = async (req, res) => {
  try {
    const { id, uid } = req.params;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Only owner can remove members" });

    // ❌ Prevent owner removal
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
