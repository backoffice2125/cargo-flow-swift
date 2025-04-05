
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileNavProvider } from '@/hooks/use-mobile';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is the first load of the application
    const isFirstLoad = sessionStorage.getItem('appOpened') !== 'true';
    
    if (isFirstLoad && !loading) {
      // Mark that the app has been opened in this session
      sessionStorage.setItem('appOpened', 'true');
      
      // Redirect to login page on first load regardless of auth status
      navigate('/login');
    }
  }, [loading, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <MobileNavProvider>
      {children}
    </MobileNavProvider>
  );
};

export default ProtectedRoute;
