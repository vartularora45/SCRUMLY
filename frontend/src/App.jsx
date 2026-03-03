import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Dashboard from './pages/Dashboard';
import MyTasks from './pages/MyTasks';
import TeamBoard from './pages/TeamBoard';
import Analytics from './pages/Analytics';
import JiraIntegration from './pages/JiraIntegration';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import TeamsPage from './pages/TeamPage.jsx';
import UserProtect from './protect/UserProtect.jsx';

import { AuthProvider } from './context/AuthContext.jsx';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<UserProtect><Dashboard /></UserProtect>} />
          <Route path="/tasks" element={<UserProtect><MyTasks /></UserProtect>} />
          <Route path="/team" element={<UserProtect><TeamBoard /></UserProtect>} />
          <Route path="/analytics" element={<UserProtect><Analytics /></UserProtect>} />
          <Route path="/jira" element={<UserProtect><JiraIntegration /></UserProtect>} />
          <Route path="/integrations" element={<UserProtect><JiraIntegration /></UserProtect>} /> {/* ← added */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/teams" element={
            <UserProtect >
              <TeamsPage />
            </UserProtect>
          } />
        </Routes>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;