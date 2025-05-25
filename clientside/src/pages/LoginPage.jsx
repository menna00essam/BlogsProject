import LoginForm from '../components/auth/LoginForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <LoginForm />;
};

export default LoginPage;