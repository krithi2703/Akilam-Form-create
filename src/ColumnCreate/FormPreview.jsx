import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Box, Button, Dialog, DialogContent, DialogTitle, Typography, TextField } from '@mui/material';
import QRCode from 'qrcode';
import FormPage from './FormPage';
import { toast } from 'react-toastify';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function FormPreview() {
  const { formId } = useParams();
  
  const query = useQuery();
  const formNo = query.get('formNo');
  const [showDistribute, setShowDistribute] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [shareableLink, setShareableLink] = useState('');

  useEffect(() => {
    const link = `${window.location.origin}/register-form/${formId}?formNo=${formNo}`;
    setShareableLink(link);
    QRCode.toDataURL(link, { width: 300 }, (err, url) => {
      if (err) {
        console.error(err);
        return;
      }
      setQrCodeUrl(url);
    });
  }, [formId, formNo]);

  const handleDistributeClick = () => {
    setShowDistribute(true);
  };

  const handleClose = () => {
    setShowDistribute(false);
  };

  return (
    <Box>
      <FormPage formId={formId} formNo={formNo} showDistributeButton={false} />
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button variant="contained" color="primary" onClick={handleDistributeClick}>
          Distribute
        </Button>
      </Box>

      <Dialog open={showDistribute} onClose={handleClose}>
        <DialogTitle>Distribute Form</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">Scan QR Code</Typography>
            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
            <Typography variant="h6" sx={{ mt: 2 }}>Or share this link:</Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={shareableLink}
              InputProps={{
                readOnly: true,
              }}
              sx={{ mt: 1 }}
            />
            <Button onClick={() => {
              navigator.clipboard.writeText(shareableLink);
              toast.success("Link copied to clipboard!");
            }} sx={{ mt: 1 }}>
              Copy Link
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
