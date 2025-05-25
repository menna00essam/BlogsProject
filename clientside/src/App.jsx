import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { PostsProvider } from './context/PostsContext';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
    <ToastContainer position="top-right" autoClose={3000} />
      <CssBaseline />
      <Router>
        <AuthProvider>
          <PostsProvider>
            <MainLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/posts/create" element={<CreatePostPage />} />
                <Route path="/posts/edit/:id" element={<EditPostPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </MainLayout>
          </PostsProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;