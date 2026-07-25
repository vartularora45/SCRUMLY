import Module from '../models/Module.js';
import Task from '../models/Task.js';

// Get modules for a team
export const getModules = async (req, res) => {
  try {
    const { teamId } = req.params;
    const modules = await Module.find({ teamId, isArchived: false }).populate('owner', 'name email avatarUrl');
    
    // Calculate health for each module
    const modulesWithHealth = await Promise.all(modules.map(async (mod) => {
      const tasks = await Task.find({ moduleId: mod._id, isArchived: false });
      
      const total = tasks.length;
      let completed = 0;
      let openBugs = 0;
      let pending = 0;
      let status = 'HEALTHY';
      
      tasks.forEach(t => {
        if (t.status === 'DONE') completed++;
        else pending++;
        if (t.status === 'BLOCKED') status = 'AT_RISK';
      });

      const completionPercentage = total > 0 ? (completed / total) * 100 : 0;
      
      return {
        ...mod.toObject(),
        openBugs,
        pendingTasks: pending,
        completionPercentage,
        status,
      };
    }));

    res.status(200).json({ success: true, data: modulesWithHealth });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching modules' });
  }
};

// Create a module
export const createModule = async (req, res) => {
  try {
    const { name, description, teamId, owner } = req.body;
    
    const newModule = await Module.create({
      name,
      description,
      teamId,
      owner: owner || req.user._id,
    });

    res.status(201).json({ success: true, data: newModule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating module' });
  }
};

// Update a module
export const updateModule = async (req, res) => {
  try {
    const mod = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: mod });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating module' });
  }
};

// Delete a module (soft delete)
export const deleteModule = async (req, res) => {
  try {
    await Module.findByIdAndUpdate(req.params.id, { isArchived: true });
    res.status(200).json({ success: true, message: 'Module deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting module' });
  }
};
