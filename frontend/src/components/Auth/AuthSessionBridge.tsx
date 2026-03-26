import { FC, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { setUnauthorizedHandler } from '@/services/api';

const AuthSessionBridge: FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { clearAuthSession } = useAuth();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthSession();
      if (pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [clearAuthSession, navigate, pathname]);

  return null;
};

export default AuthSessionBridge;
