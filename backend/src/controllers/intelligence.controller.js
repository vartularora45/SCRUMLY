import { generateEngineeringIntelligence } from '../services/intelligence.service.js';
import Team from '../models/Team.js';

export const getProjectIntelligence = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Verify team exists and user is a member
    const team = await Team.findOne({
      _id: teamId,
      'members.user': req.user._id,
    });

    if (!team) {
      return res.status(403).json({ success: false, message: 'Unauthorized or team not found' });
    }

    const report = await generateEngineeringIntelligence(teamId);

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Intelligence Controller Error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating intelligence' });
  }
};
