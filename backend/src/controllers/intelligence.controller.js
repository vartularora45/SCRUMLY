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

export const getDashboardDirect = async (req, res) => {
  try {
    let teamId = null;

    if (req.user.teams && req.user.teams.length > 0) {
      const firstTeam = req.user.teams[0];
      teamId = firstTeam._id ? firstTeam._id.toString() : firstTeam.toString();
    } else {
      const dbTeams = await Team.find({ 'members.user': req.user._id });
      if (dbTeams.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            metrics: { totalTasks: 0, completedTasks: 0, blockedTasks: 0, overdueTasks: 0, completionRate: 0 },
            intelligence: {
              healthScore: 100,
              healthStatus: 'Healthy',
              rootCauseAnalysis: ['You are not a member of any team yet. Create or join a team to view intelligence analytics.'],
              riskPredictions: { sprintFailureRisk: 0, deliveryRisk: 'Low', overloadedDevelopers: [], modulesAtRisk: [] },
              recommendations: ['Create a team or join an existing one to get started.']
            }
          }
        });
      }
      teamId = dbTeams[0]._id.toString();
    }

    const report = await generateEngineeringIntelligence(teamId);
    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Direct Dashboard Controller Error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating dashboard intelligence' });
  }
};
