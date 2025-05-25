import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Modal = ({
  open = true,
  title,
  children,
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Sure',
  confirmColor = 'primary',
  disableConfirm = false
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {title}
        <IconButton onClick={onCancel}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>{children}</DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          disabled={disableConfirm}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Modal;

