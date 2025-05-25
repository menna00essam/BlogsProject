import RegisterForm from '../components/auth/RegisterForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <RegisterForm />;
};

export default RegisterPage;