import { toast } from 'react-toastify';

export const notify = (type, message) => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warning':
      toast.warn(message);
      break;
    case 'info':
    default:
      toast.info(message);
  }
};
