import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Card,
  CardContent,
  Stack,
  Box,
  Button,
} from "@mui/material";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
} from "react-share";
import {
  Facebook,
  X as TwitterIcon,
  LinkedIn,
  WhatsApp,
  Share as ShareIcon,
} from "@mui/icons-material";
import sucessImg from "./sucess.gif";

// ✅ Custom Hook for dialog state
export const useDialog = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return { open, handleOpen, handleClose };
};

// ✅ Success Dialog
export const CustomDialog = ({ open, handleClose }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          p: 4,
        }}
      >
        <img
          src={sucessImg}
          alt="Success"
          style={{ width: "50%", height: "auto", marginBottom: "16px" }}
        />
        <Typography variant="h6" color="green" gutterBottom>
          Form Created Successfully!
        </Typography>
        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          onClick={handleClose}
          sx={{ mt: 2 }}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

// ✅ Social Share Modal
export const SocialShareDialog = ({ open, handleClose ,title}) => {
  const shareUrl = window.location.href; // Current page URL
  const titlee =`Your Link : ${title}` || "Check out this page!";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle textAlign="center">Share This Page</DialogTitle>
      <DialogContent>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            textAlign: "center",
            mt: 1,
          }}
        >
          <CardContent>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Spread the word on your favorite platform
            </Typography>

            <Stack direction="row" justifyContent="center" spacing={2}>
              <FacebookShareButton url={shareUrl} quote={titlee}>
                <Facebook fontSize="large" />
              </FacebookShareButton>

              <TwitterShareButton url={shareUrl} title={titlee}>
                <TwitterIcon fontSize="large" />
              </TwitterShareButton>

              <LinkedinShareButton url={shareUrl} title={titlee}>
                <LinkedIn fontSize="large" />
              </LinkedinShareButton>

              <WhatsappShareButton url={shareUrl} title={titlee} separator=":: ">
                <WhatsApp fontSize="large" />
              </WhatsappShareButton>
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>

      <Box textAlign="center" mb={2}>
        <Button variant="contained" color="primary" onClick={handleClose}>
          Close
        </Button>
      </Box>
    </Dialog>
  );
};
