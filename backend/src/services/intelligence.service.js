import OpenAI from 'openai';
import Task from '../models/Task.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Calculate raw metrics from database
export const calculateRawMetrics = async (teamId) => {
  const tasks = await Task.find({ teamId, isArchived: false }).populate('assignee', 'name email');
  
  const now = new Date();
  
  let totalTasks = tasks.length;
  let completedTasks = 0;
  let blockedTasks = 0;
  let overdueTasks = 0;
  let inProgressTasks = 0;
  let todoTasks = 0;
  
  const assigneeStats = {};
  
  tasks.forEach(task => {
    if (task.status === 'DONE') completedTasks++;
    if (task.status === 'BLOCKED') blockedTasks++;
    if (task.status === 'IN_PROGRESS') inProgressTasks++;
    if (task.status === 'TODO') todoTasks++;
    
    if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE') {
      overdueTasks++;
    }
    
    if (task.assignee) {
      const aId = task.assignee._id.toString();
      if (!assigneeStats[aId]) {
        assigneeStats[aId] = { name: task.assignee.name, total: 0, completed: 0, blocked: 0, overdue: 0 };
      }
      assigneeStats[aId].total++;
      if (task.status === 'DONE') assigneeStats[aId].completed++;
      if (task.status === 'BLOCKED') assigneeStats[aId].blocked++;
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE') assigneeStats[aId].overdue++;
    }
  });

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    totalTasks,
    completedTasks,
    blockedTasks,
    overdueTasks,
    inProgressTasks,
    todoTasks,
    completionRate,
    assigneeStats,
    rawTasks: tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority, assignee: t.assignee?.name }))
  };
};

export const generateEngineeringIntelligence = async (teamId) => {
  const metrics = await calculateRawMetrics(teamId);
  
  const prompt = `You are the core AI of SCRUMLY, an Engineering Intelligence Platform.
Analyze the following project metrics and generate a JSON report.
DO NOT output any markdown, only valid JSON.

Metrics:
- Total Tasks: ${metrics.totalTasks}
- Completed: ${metrics.completedTasks} (${metrics.completionRate.toFixed(1)}%)
- In Progress: ${metrics.inProgressTasks}
- To Do: ${metrics.todoTasks}
- Blocked Tasks: ${metrics.blockedTasks}
- Overdue Tasks: ${metrics.overdueTasks}
- Developer Stats: ${JSON.stringify(Object.values(metrics.assigneeStats))}
- Sample Tasks: ${JSON.stringify(metrics.rawTasks.slice(0, 10))}

Return a JSON object EXACTLY matching this structure:
{
  "healthScore": 0-100 (integer),
  "healthStatus": "Healthy" | "Warning" | "Critical",
  "rootCauseAnalysis": [
    "String explaining why the score is what it is (e.g. 'Project delayed because Database Migration is blocked')",
    "Another reason based strictly on the data provided"
  ],
  "riskPredictions": {
    "sprintFailureRisk": 0-100 (integer representing percentage),
    "deliveryRisk": "Low" | "Medium" | "High",
    "overloadedDevelopers": ["Name1", "Name2"],
    "modulesAtRisk": ["General"]
  },
  "recommendations": [
    "Actionable recommendation 1 (e.g. 'Assign Backend API to Vartul')",
    "Actionable recommendation 2"
  ]
}

CRITICAL: Do not hallucinate. Base everything ONLY on the provided metrics. If no tasks exist, return a 100 score with neutral messages.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const aiData = JSON.parse(response.choices[0].message.content);
    return {
      metrics: {
        totalTasks: metrics.totalTasks,
        completedTasks: metrics.completedTasks,
        blockedTasks: metrics.blockedTasks,
        overdueTasks: metrics.overdueTasks,
        completionRate: metrics.completionRate,
      },
      intelligence: aiData
    };
  } catch (error) {
    console.error("AI Intelligence Generation Error:", error);
    // Fallback if AI fails
    return {
      metrics,
      intelligence: {
        healthScore: 50,
        healthStatus: "Warning",
        rootCauseAnalysis: ["AI analysis temporarily unavailable due to API error."],
        riskPredictions: { sprintFailureRisk: 50, deliveryRisk: "Medium", overloadedDevelopers: [], modulesAtRisk: [] },
        recommendations: ["Please check the AI configuration."]
      }
    };
  }
};
