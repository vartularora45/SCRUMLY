import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, X, KeyRound, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';

// ─── Forgot Password Modal (3 Steps) ─────────────────────────────────────────
const ForgotPasswordModal = ({ onClose }) => {
  const [step,            setStep]            = useState(1);
  const [email,           setEmail]           = useState('');
  const [otp,             setOtp]             = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading,       setIsLoading]       = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');

  const clearError = () => setError('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true); clearError();
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/invites/forgot-password`, { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally { setIsLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true); clearError();
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/invites/verify-reset-otp`, { email, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    setIsLoading(true); clearError();
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/invites/reset-password`, { email, otp, newPassword });
      setSuccess('Password reset successfully! You can now login.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally { setIsLoading(false); }
  };

  const steps = ['Email', 'Verify OTP', 'New Password'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
            <KeyRound className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Forgot Password?</h3>
          <p className="text-slate-500 text-sm mt-1">
            {step === 1 && 'Enter your email to receive a one-time password.'}
            {step === 2 && `Enter the 6-digit code sent to ${email}`}
            {step === 3 && 'Set your new password.'}
          </p>
        </div>

        {/* Step indicator */}
        {!success && (
          <div className="flex items-center mb-6 gap-1">
            {steps.map((label, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium ${step === i + 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-3 rounded-full transition-all ${step > i + 1 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <Input label="Email Address" type="email" name="email" placeholder="Enter your registered email"
              icon={Mail} value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} required />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Send OTP</Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <Input label="One-Time Password" type="text" name="otp" placeholder="6-digit OTP"
              icon={ShieldCheck} value={otp} onChange={(e) => { setOtp(e.target.value); clearError(); }} maxLength={6} required />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Verify Code</Button>
            <p className="text-center text-xs text-slate-500">
              Didn't receive it?{' '}
              <button type="button" onClick={() => { setStep(1); setOtp(''); clearError(); }}
                className="text-indigo-600 font-semibold hover:underline">
                Resend OTP
              </button>
            </p>
          </form>
        )}

        {step === 3 && !success && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input label="New Password" type="password" name="newPassword" placeholder="Min. 6 characters"
              icon={Lock} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); clearError(); }} required />
            <Input label="Confirm Password" type="password" name="confirmPassword" placeholder="Re-enter new password"
              icon={KeyRound} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }} required />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Reset Password</Button>
          </form>
        )}

        {success && (
          <Button type="button" className="w-full" size="lg" onClick={onClose}>Back to Login</Button>
        )}
      </div>
    </div>
  );
};

// ─── Main Login Page ──────────────────────────────────────────────────────────
const Login = () => {
  const [isLoading,          setIsLoading]          = useState(false);
  const [error,              setError]              = useState('');
  const [formData,           setFormData]           = useState({ email: '', password: '' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate  = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        { email: formData.email, password: formData.password },
        { withCredentials: true }
      );
      login(data.data.user, data.data.accessToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/google`,
        { credential: credentialResponse.credential },
        { withCredentials: true }
      );
      // FIX: was using data.user / data.token (old shape). Now uses data.data.user / data.data.accessToken
      login(data.data.user, data.data.accessToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
    setTimeout(() => setError(''), 4000);
  };

  const features = [
    'AI-powered task extraction from chat',
    'Real-time Kanban board with your team',
    'Jira 2-way sync in one click',
    'Velocity & performance analytics',
  ];

  return (
    <div className="min-h-screen flex">
      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}

      {/* ── Left Panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 flex-col justify-between p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/[0.03]" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Scrumlyn</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Run faster sprints<br />with AI by your side.
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed mb-10">
            Type in your team chat. AI reads the conversation and creates tasks automatically.
          </p>

          <ul className="space-y-4">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-indigo-100">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-indigo-300 text-sm">
          © {new Date().getFullYear()} Scrumlyn. All rights reserved.
        </p>
      </div>

      {/* ── Right Panel ────────────────────────────────────────── */}
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
            <h2 className="text-3xl font-extrabold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 mt-2">Sign in to continue to your workspace.</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              id="login-email"
              placeholder="you@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            <div>
              <Input
                label="Password"
                type="password"
                name="password"
                id="login-password"
                placeholder="••••••••"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button type="submit" id="login-submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign In <LogIn className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-4 text-slate-400 text-sm">or continue with</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="400"
            />
          </div>

          <p className="mt-8 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;