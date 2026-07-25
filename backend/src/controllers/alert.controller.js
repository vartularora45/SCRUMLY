import Alert from '../models/Alert.js';
import { checkAndGenerateAlerts } from '../services/alert.service.js';

// Get alerts for a team
export const getAlerts = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Auto-generate before fetching so they are fresh
    await checkAndGenerateAlerts(teamId);

    const alerts = await Alert.find({ teamId, isRead: false }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching alerts' });
  }
};

// Mark alert as read
export const markAlertAsRead = async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true, message: 'Alert marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating alert' });
  }
};
