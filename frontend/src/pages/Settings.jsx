import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Save, AlertTriangle, Sparkles, LogOut, Trash2,
  Lock, Shield, CheckCircle2
} from 'lucide-react';
import api from '../api/client.js';

const Settings = () => {
  const { user, token, logout, updateUser, activeTeam } = useAuth();
  const toast = useToast();

  const [name,      setName]      = useState(user?.name  || '');
  const [isSaving,  setIsSaving]  = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // AI settings from activeTeam (read-only in this view — managed per-team)
  const aiModel     = activeTeam?.settings?.aiModel     || 'llama-3.3-70b-versatile';
  const threshold   = activeTeam?.settings?.confidenceThreshold ?? 0.7;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Display name cannot be empty.');
      return;
    }
    setIsSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { name: name.trim() }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateUser(data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8 animate-slide-up">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
          <p className="text-slate-500 mt-1">Manage your account preferences and workspace settings.</p>
        </div>

        {/* Profile Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" /> Profile Settings
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-5 max-w-lg">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 overflow-hidden shadow-md">
                <img
                  src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'user')}&backgroundColor=b6e3f4`}
                  alt="Profile"
                  className="w-full h-full"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                  placeholder="Your display name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed after registration.</p>
            </div>

            <div className="pt-2">
              <Button type="submit" isLoading={isSaving}>
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* AI Configuration (read-only — info display) */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" /> AI Configuration
          </h3>
          <p className="text-sm text-slate-500 mb-5">
            AI settings are configured per-team. Go to{' '}
            <span className="text-indigo-600 font-medium">Teams → Settings</span> to change them.
          </p>
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-700">Current AI Model</p>
                <p className="text-xs text-slate-400 mt-0.5">Active team configuration</p>
              </div>
              <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                {aiModel}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-700">Confidence Threshold</p>
                <p className="text-xs text-slate-400 mt-0.5">Min. confidence to auto-create tasks</p>
              </div>
              <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                {Math.round(threshold * 100)}%
              </span>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" /> Security
          </h3>
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700">JWT Authentication</p>
                <p className="text-xs text-slate-400">Access tokens expire every 15 minutes with auto-refresh</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700">Secure Cookie Session</p>
                <p className="text-xs text-slate-400">Refresh tokens stored in HttpOnly cookies</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Lock className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700">Provider</p>
                <p className="text-xs text-slate-400 capitalize">{user?.provider || 'local'} account</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-red-100">
          <h3 className="text-lg font-bold text-red-600 mb-5 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl">
              <div>
                <h4 className="font-medium text-slate-800">Log Out</h4>
                <p className="text-sm text-slate-500">End your current session on this device.</p>
              </div>
              <Button
                variant="secondary"
                onClick={handleLogout}
                isLoading={isLoggingOut}
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
