import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const UserProtect = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      // ✅ Token expiry check
      if (user?.tokenExpiry && Date.now() > user.tokenExpiry) {
        localStorage.removeItem("user");
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      // ✅ Role based access
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      setIsAuthorized(true);
      setLoading(false);
    } catch (error) {
      console.error("Invalid user data:", error);
      localStorage.removeItem("user");
      setIsAuthorized(false);
      setLoading(false);
    }
  }, [allowedRoles]);

  if (loading) {
    return <div>Checking authentication...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default UserProtect;