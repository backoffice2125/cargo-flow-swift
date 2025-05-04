
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteWithRolesProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRouteWithRoles: React.FC<ProtectedRouteWithRolesProps> = ({ 
  children,
  allowedRoles = [] 
}) => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  // Still loading auth state
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and the user doesn't have the required role
  if (allowedRoles.length > 0 && (!profile || !allowedRoles.includes(profile.role))) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this page.",
      variant: "destructive",
    });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRouteWithRoles;
