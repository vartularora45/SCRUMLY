import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-xl">S</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="text-sm text-slate-500">Loading Scrumlyn...</p>
    </div>
  </div>
);

const UserProtect = ({ children, allowedRoles = [] }) => {
  const location        = useLocation();
  const { isLoading }   = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checked,      setChecked]      = useState(false);

  useEffect(() => {
    if (isLoading) return;

    try {
      const storedUser  = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      // Must have BOTH user and token
      if (!storedUser || !storedToken) {
        setIsAuthorized(false);
        setChecked(true);
        return;
      }

      const user = JSON.parse(storedUser);

      // Role-based access check
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        setIsAuthorized(false);
        setChecked(true);
        return;
      }

      setIsAuthorized(true);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setIsAuthorized(false);
    } finally {
      setChecked(true);
    }
  }, [isLoading, allowedRoles]);

  if (isLoading || !checked) return <LoadingScreen />;
  if (!isAuthorized) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export default UserProtect;