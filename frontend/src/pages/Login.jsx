import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();
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
                {
                    email: formData.email,
                    password: formData.password,
                }
            );

           login(data.data.user, data.data.accessToken);
           
            navigate('/');
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(message);
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
    navigate("/");

  } catch (error) {
    setError(error.response?.data?.message || "Google login failed");
  }

  };
  // Google Login Error Handler
  const handleGoogleError = () => {
    console.error('Google Login Failed');
    setError("Google login failed. Please try again.");
    setTimeout(() => {
      setError("");
    }, 3000);
  };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md p-8 shadow-xl border-slate-200">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-blue-200">
                        S
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
                    <p className="text-slate-500 mt-2">Please enter your details to sign in.</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        icon={Mail}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-slate-600 cursor-pointer">
                            <input type="checkbox" className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            Remember me
                        </label>
                        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Forgot password?</a>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={isLoading}
                    >
                        Sign In <LogIn className="w-4 h-4 ml-2" />
                    </Button>
                </form>
                {/* Google Login Section */}
       

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
         <div className="mb-4 text-center text-sm text-gray-600">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="300"
            />
          </div>
        </div>


                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                            Register
                        </Link>
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