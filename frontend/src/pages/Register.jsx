import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Zap, ShieldCheck, Bot, TrendingUp } from 'lucide-react';
import axios from 'axios';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');
  const [formData,  setFormData]  = useState({
    fullName: '',
    email:    '',
    password: '',
    confirmPassword: '',
  });
  const navigate    = useNavigate();
  const { login }   = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/register`,
        {
          name:     formData.fullName,
          email:    formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );
      login(data.data.user, data.data.accessToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const perks = [
    { icon: Bot,        text: 'AI reads your chat and creates tasks automatically' },
    { icon: ShieldCheck,text: 'Secure JWT auth with refresh token rotation' },
    { icon: TrendingUp, text: 'Real-time team analytics and velocity tracking' },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ───────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 flex-col justify-between p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/[0.04] -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-14">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Scrumlyn</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white leading-tight mb-3">
            Your AI Scrum<br />Master awaits.
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed mb-10">
            Set up in seconds. No credit card required. Start shipping faster today.
          </p>

          <div className="space-y-5">
            {perks.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-indigo-100 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-indigo-300 text-sm">
          © {new Date().getFullYear()} Scrumlyn. Free forever for small teams.
        </p>
      </div>

      {/* ── Right Panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md animate-slide-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Scrumlyn</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900">Create your account</h2>
            <p className="text-slate-500 mt-2">Join thousands of teams shipping faster with AI.</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              id="reg-name"
              placeholder="Jane Smith"
              icon={User}
              value={formData.fullName}
              onChange={handleChange}
              required
              autoComplete="name"
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              id="reg-email"
              placeholder="you@company.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              id="reg-password"
              placeholder="Min. 6 characters"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              id="reg-confirm-password"
              placeholder="Re-enter password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />

            <Button id="reg-submit" type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Create Free Account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-slate-400">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;