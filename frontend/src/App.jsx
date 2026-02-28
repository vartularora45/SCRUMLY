import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MyTasks from './pages/MyTasks';
import TeamBoard from './pages/TeamBoard';
import Analytics from './pages/Analytics';
import JiraIntegration from './pages/JiraIntegration';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext.jsx';
import TeamsPage from './pages/TeamPage.jsx';
function App() {
  return (
    <AuthProvider>
    <Routes>
      <Route path="/" element={
        
          <Dashboard />
        
      } />
      <Route path="/tasks" element={
        
          <MyTasks />
        
      } />
      
      <Route path="/team" element={<TeamBoard />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/jira" element={<JiraIntegration />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/teams" element={<TeamsPage />} />
    </Routes>
    </AuthProvider>
  );
}

export default App;
