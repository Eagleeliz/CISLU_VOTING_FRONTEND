import * as React from "react"; // Added to prevent JSX errors
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import type { RootState } from "../app/store";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoutes = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, requireProfileCompletion, user } = useSelector(
    (state: RootState) => state.auth
  );
  const location = useLocation();

  // 1. Kick out unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Redirect to Profile Completion if the backend says it's required
  // We check location.pathname to prevent an infinite redirect loop
  if (requireProfileCompletion && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  // 3. Prevent users from manually going back to the profile page once done
  if (!requireProfileCompletion && location.pathname === "/complete-profile") {
    const dashboardPath = user?.role === "admin" ? "/AdminDashBoard" : "/dashboard";
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoutes;