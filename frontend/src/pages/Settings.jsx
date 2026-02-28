import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { User, Mail, Save, AlertTriangle, Sparkles, LogOut, Trash2 } from 'lucide-react';

const Settings = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                    <p className="text-slate-500 mt-1">Manage your account preferences and workspace settings.</p>
                </div>

                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" /> Profile Settings
                    </h3>
                    <div className="space-y-4 max-w-lg">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden relative border-2 border-white shadow-sm">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vartul" alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <Button variant="secondary" size="sm">Change Avatar</Button>
                            </div>
                        </div>

                        <Input label="Display Name" defaultValue="Vartul Arora" icon={User} />
                        <Input label="Email Address" defaultValue="vartul@scrumly.app" icon={Mail} />

                        <div className="pt-4">
                            <Button onClick={handleSave} isLoading={isLoading}>
                                <Save className="w-4 h-4 mr-2" /> Save Changes
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" /> AI Configuration
                    </h3>
                    <div className="space-y-6 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">AI Model</label>
                            <select className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100">
                                <option>GPT-4 (Recommended)</option>
                                <option>Claude 3.5 Sonnet</option>
                                <option>Llama 3</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Select the underlying model for Scrumly AI features.</p>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-medium text-slate-700">Confidence Threshold</label>
                                <span className="text-sm text-slate-500">75%</span>
                            </div>
                            <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            <p className="text-xs text-slate-500 mt-1">AI suggestions below this confidence score will be hidden.</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-red-100 bg-red-50/10">
                    <h3 className="text-lg font-bold text-red-600 mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Danger Zone
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white border border-red-100 rounded-xl">
                            <div>
                                <h4 className="font-medium text-slate-800">Log Out</h4>
                                <p className="text-sm text-slate-500">End your current session on this device.</p>
                            </div>
                            <Button variant="secondary" className="text-slate-600 hover:text-slate-800">
                                <LogOut className="w-4 h-4 mr-2" /> Logout
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white border border-red-200 rounded-xl">
                            <div>
                                <h4 className="font-medium text-red-700">Delete Account</h4>
                                <p className="text-sm text-red-500/80">Permanently delete your account and all data.</p>
                            </div>
                            <Button variant="danger">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default Settings;
