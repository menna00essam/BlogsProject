import { CircularProgress, Backdrop, Box } from '@mui/material';

const Loader = ({ fullScreen = true, size = 40, color = 'primary' }) => {
  return fullScreen ? (
    <Backdrop open sx={{ color: '#fff', zIndex: 9999 }}>
      <CircularProgress color={color} size={size} />
    </Backdrop>
  ) : (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 4
      }}
    >
      <CircularProgress color={color} size={size} />
    </Box>
  );
};

export default Loader;

