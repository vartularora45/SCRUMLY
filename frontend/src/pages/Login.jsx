import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, X, KeyRound, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { useAuth } from '../context/AuthContext';

// ─── Forgot Password Modal (3 Steps) ─────────────────────────────────────────
const ForgotPasswordModal = ({ onClose }) => {
    const [step, setStep]                       = useState(1);
    const [email, setEmail]                     = useState('');
    const [otp, setOtp]                         = useState('');
    const [newPassword, setNewPassword]         = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading]             = useState(false);
    const [error, setError]                     = useState('');
    const [success, setSuccess]                 = useState('');

    const clearError = () => setError('');

    // Step 1: OTP bhejo
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

    // Step 2: OTP verify karo
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

    // Step 3: Password reset karo
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">

                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-5">
                    <h3 className="text-xl font-bold text-slate-800">Forgot Password?</h3>
                    <p className="text-slate-500 text-sm mt-1">
                        {step === 1 && "Enter your email to receive an OTP."}
                        {step === 2 && `Enter the 6-digit OTP sent to ${email}`}
                        {step === 3 && "Set your new password."}
                    </p>
                </div>

                {/* Step indicator */}
                {!success && (
                    <div className="flex items-center mb-6 gap-1">
                        {steps.map((label, i) => (
                            <React.Fragment key={i}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                                        ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        {step > i + 1 ? '✓' : i + 1}
                                    </div>
                                    <span className={`text-[10px] mt-0.5 ${step === i + 1 ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                                        {label}
                                    </span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mb-3 transition-colors ${step > i + 1 ? 'bg-green-400' : 'bg-slate-200'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">{success}</div>
                )}

                {/* Step 1 */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <Input label="Email" type="email" name="email" placeholder="Enter your registered email"
                            icon={Mail} value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} required />
                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Send OTP</Button>
                    </form>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <Input label="Enter OTP" type="text" name="otp" placeholder="6-digit OTP"
                            icon={ShieldCheck} value={otp} onChange={(e) => { setOtp(e.target.value); clearError(); }} maxLength={6} required />
                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Verify OTP</Button>
                        <p className="text-center text-xs text-slate-500">
                            Didn't receive it?{' '}
                            <button type="button" onClick={() => { setStep(1); setOtp(''); clearError(); }}
                                className="text-blue-600 font-medium hover:underline">
                                Resend OTP
                            </button>
                        </p>
                    </form>
                )}

                {/* Step 3 */}
                {step === 3 && !success && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <Input label="New Password" type="password" name="newPassword" placeholder="Min. 6 characters"
                            icon={Lock} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); clearError(); }} required />
                        <Input label="Confirm Password" type="password" name="confirmPassword" placeholder="Re-enter new password"
                            icon={KeyRound} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }} required />
                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Reset Password</Button>
                    </form>
                )}

                {/* Success */}
                {success && (
                    <Button type="button" className="w-full" size="lg" onClick={onClose}>Back to Login</Button>
                )}
            </div>
        </div>
    );
};

// ─── Main Login Component ─────────────────────────────────────────────────────
const Login = () => {
    const [isLoading, setIsLoading]                   = useState(false);
    const [error, setError]                           = useState('');
    const [formData, setFormData]                     = useState({ email: '', password: '' });
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
                { email: formData.email, password: formData.password }
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
                { credential: credentialResponse.credential }
            );
            login(data.user, data.token);
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Google login failed');
        }
    };

    const handleGoogleError = () => {
        setError('Google login failed. Please try again.');
        setTimeout(() => setError(''), 3000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">

            {showForgotPassword && (
                <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
            )}

            <Card className="w-full max-w-md p-8 shadow-xl border-slate-200">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-blue-200">
                        S
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
                    <p className="text-slate-500 mt-2">Please enter your details to sign in.</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Email" type="email" name="email" placeholder="Enter your email"
                        icon={Mail} value={formData.email} onChange={handleChange} required />
                    <Input label="Password" type="password" name="password" placeholder="••••••••"
                        icon={Lock} value={formData.password} onChange={handleChange} required />

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-slate-600 cursor-pointer">
                            <input type="checkbox" className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            Remember me
                        </label>
                        <button type="button" onClick={() => setShowForgotPassword(true)}
                            className="text-blue-600 hover:text-blue-700 font-medium">
                            Forgot password?
                        </button>
                    </div>

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                        Sign In <LogIn className="w-4 h-4 ml-2" />
                    </Button>
                </form>

                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-400">or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="mb-4 text-center">
                    <div className="flex justify-center">
                        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError}
                            useOneTap={false} theme="outline" size="large" text="signin_with" shape="rectangular" width="300" />
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">Register</Link>
                    </p>
                </div>
            </Card>

            <div className="absolute bottom-6 text-slate-400 text-xs text-center w-full">
                &copy; {new Date().getFullYear()} Scrumly Inc. All rights reserved.
            </div>
        </div>
    );
};

export default Login;