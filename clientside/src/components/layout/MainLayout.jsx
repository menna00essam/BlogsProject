import { Box, Container, CssBaseline } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <CssBaseline />
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, 
          mt: 4,
          mb: 4,
        }}
      >
        <Container>
          {children}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;