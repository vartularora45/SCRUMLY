import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import axios from 'axios';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
const Register = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const navigate = useNavigate();
    const { login } = useAuth();
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

        setIsLoading(true);

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/auth/register`,
                {
                    name: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                }
            );
            login(data.data.user, data.data.accessToken);

            navigate('/');
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md p-8 shadow-xl border-slate-200">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-blue-200">
                        S
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Create an account</h2>
                    <p className="text-slate-500 mt-2">Join Scrumly and boost your productivity.</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        type="text"
                        name="fullName"
                        placeholder="John Doe"
                        icon={User}
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
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
                        placeholder="Create a password"
                        icon={Lock}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm password"
                        icon={Lock}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <Button
                        type="submit"
                        className="w-full mt-2"
                        size="lg"
                        isLoading={isLoading}
                    >
                        Create Account <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                            Login
                        </Link>
                    </p>
                </div>
            </Card>

            <div className="absolute bottom-6 text-slate-400 text-xs text-center w-full">
                By registering, you agree to our Terms of Service and Privacy Policy.
            </div>
        </div>
    );
};

export default Register;