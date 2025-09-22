// CustomDialog.js
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

import sucessImg from './sucess.gif';


// ✅ Custom hook for dialog state
export const useDialog = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return { open, handleOpen, handleClose };
};

// ✅ Custom Dialog component
export const CustomDialog = ({ open, handleClose }) => {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" width="50%" height="50%">
    
      <DialogContent justifyContent="center" alignItems="center" style={{ textAlign: 'center', padding: '20px' }} >
        
          <img src={sucessImg} alt="Example" style={{ width: '50%', height: 'auto' }} />
          <Typography variant="h6" align="center" gutterBottom textcolor="green">
            Form Created Successfully!
          </Typography>
      </DialogContent>
    </Dialog>
  );
};
