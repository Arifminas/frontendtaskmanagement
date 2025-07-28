import { toast } from 'react-toastify';


export const notifyInfo = (msg) => toast.info(msg,{ position: 'top-right', autoClose: 3000 });
export const notifySuccess = (msg) => toast.success(msg, { position: 'top-right', autoClose: 3000 });
export const notifyError = (msg) => toast.error(msg, { position: 'top-right', autoClose: 4000 });