import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../axiosConfig";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from 'react-toastify';
import { useDialog, CustomDialog } from "../SideBar/MuiDialogExample";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  TextField,
  Button,
  CardActions,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  AppBar,
  Toolbar,
  IconButton,
  RadioGroup,
  Radio,
  FormHelperText,
  FormLabel,
  DialogActions
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import Register from "../Registration/Register";
import { sendWhatsAppMessage } from "../whatsappService";
import { validateField } from "../utils/validationUtils";
import PaymentButton from '../Razor/PaymentButton';

// Helper to read query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const FormPage = ({ isPreview = false }) => {
  const navigate = useNavigate();
  const { formId } = useParams();
  const query = useQuery();
  const formNo = query.get("formNo");

  const [formDetails, setFormDetails] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formValues, setFormValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [columnOptions, setColumnOptions] = useState({});
  const [formValidationRules, setFormValidationRules] = useState({});
  const [isRegistrationEnded, setIsRegistrationEnded] = useState(false);
  const [showRegistrationEndedDialog, setShowRegistrationEndedDialog] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDescription, setPaymentDescription] = useState('');
  const [paymentOrderId, setPaymentOrderId] = useState(null); // To store order ID after successful payment

  const userId = sessionStorage.getItem("userId");
  const userName = sessionStorage.getItem("userName");
  const isFormOnlyUser = sessionStorage.getItem("isFormOnlyUser") === "true";
  const token = sessionStorage.getItem("token");

  const { open, handleOpen, handleClose } = useDialog();
    const handleLogout = () => {
    sessionStorage.clear();
    navigate(`/${formId}`, { replace: true });
  };

  // const handleOpenRegisterDialog = () => setRegisterDialogOpen(true);
  const handleCloseRegisterDialog = () => setRegisterDialogOpen(false);
  const handleRegistrationSuccess = () => {
    handleCloseRegisterDialog();
    window.location.reload();
  };

  const handlePaymentSuccess = async (paymentId, orderId) => {
    toast.success(`Payment successful! Payment ID: ${paymentId}.`);
    setPaymentOrderId(orderId); // Store order ID if needed
    setShowPaymentDialog(false); // Close payment dialog
    handleOpen(); // Open the success dialog

    if (userId && formDetails && formDetails.formName) {
      const message = `Your form \"${formDetails.formName}\" has been submitted successfully.`;
      try {
        await sendWhatsAppMessage(userId, message);
        toast.success("WhatsApp notification sent.");
      } catch (whatsappError) {
        console.error("WhatsApp Error:", whatsappError);
        toast.error("Failed to send WhatsApp notification.");
      }
    }

    setTimeout(() => {
      handleLogout();
    }, 2500);
  };

  const handlePaymentFailure = (error) => {
    toast.error(`Payment failed: ${error}`);
    setShowPaymentDialog(false); // Close payment dialog
    // Decide what to do on failure: allow retry, show error, etc.
    // For now, let's just close the dialog.
  };

  const fetchFormAndOptions = useCallback(async () => {
    if (!formId) {
      setError("No form selected. Please go back and select a form.");
      setLoading(false);
      return;
    }

    if (!isPreview && !isFormOnlyUser && !token) {
      navigate(`/${formId}`);
      return;
    }

    try {
      setLoading(true);
      let url = `/formdetails/user/form-columns?formId=${formId}`;
      if (formNo) {
        url += `&formNo=${formNo}`;
      }

      const headers = {};
      if (isPreview) {
        headers.userid = "preview";
      }

      const response = await api.get(url, { headers });

      if (response.data && response.data.length > 0) {
        let sortedColumns = response.data.sort(
          (a, b) => a.SequenceNo - b.SequenceNo
        );

        // Fetch validation rules for the form
        const validationRulesResponse = await api.get(`/validation/${formId}`);
        const formValidationRulesMap = new Map();
        validationRulesResponse.data.forEach(rule => {
          formValidationRulesMap.set(rule.ColId, rule.ValidationList);
        });

        // Merge validation rules into columns
        sortedColumns = sortedColumns.map(col => ({
          ...col,
          Validation: formValidationRulesMap.get(col.ColId) || null, // Add Validation property
        }));

        setColumns(sortedColumns);
        setFormDetails({
          formName: sortedColumns[0].FormName,
          formNo: sortedColumns[0].FormNo,
          endDate: sortedColumns[0].Enddate,
          startDate: sortedColumns[0].Startdate,
          fee: sortedColumns[0].Fee,
          bannerImage: sortedColumns[0].BannerImage,
          imageOrLogo: sortedColumns[0].ImageOrLogo,
        });
        // Calculate if registration has ended
        const endDate = sortedColumns[0].Enddate;
        if (endDate) {
          setIsRegistrationEnded(new Date(endDate) < new Date());
        } else {
          setIsRegistrationEnded(false); // If no end date, registration is not considered ended
        }

        const optionsPromises = sortedColumns.map(async (col) => {
          if (col.DataType?.toLowerCase() === "select") {
            const res = await api.get(`/dropdown-dtl/${col.ColId}?formId=${formId}`);
            return { colId: col.ColId, options: res.data.map(item => item.DropdownName) };
          } else if (col.DataType?.toLowerCase() === "radio") {
            const res = await api.get(`/radiobox-dtl/${col.ColId}?formId=${formId}`);
            return { colId: col.ColId, options: res.data.map(item => item.RadioBoxName) };
          } else if (col.DataType?.toLowerCase() === "checkbox") {
            const res = await api.get(`/checkbox-dtl/${col.ColId}?formId=${formId}`);
            return { colId: col.ColId, options: res.data.map(item => item.CheckBoxName) };
          }
          return null;
        });

        const fetchedOptions = await Promise.all(optionsPromises);
        const newColumnOptions = {};
        fetchedOptions.forEach(item => {
          if (item) {
            newColumnOptions[item.colId] = item.options;
          }
        });
        setColumnOptions(newColumnOptions);
      } else {
        setError("No columns found for this form version.");
      }
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error("Error fetching form layout:", err);
        toast.error(err.response?.data?.message || "Failed to fetch form layout.");
      }
    } finally {
      setLoading(false);
    }
  }, [formId, formNo, isPreview, isFormOnlyUser, token]);

  useEffect(() => {
    fetchFormAndOptions();

    const handleOptionsUpdate = () => {
      toast.info('Refreshing form with new options...');
      fetchFormAndOptions();
    };

    window.addEventListener('optionsUpdated', handleOptionsUpdate);

    return () => {
      window.removeEventListener('optionsUpdated', handleOptionsUpdate);
    };
  }, [fetchFormAndOptions]);

  const handleInputChange = (colId, event, type) => {
    let value;
    const file = event.target.files ? event.target.files[0] : null;

    if (type === "checkbox") {
      value = event.target.checked;
    } else if (type === "file" || type === "photo") {
      if (file) {
        const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
        // MAX_FILE_SIZE_BYTES is no longer needed for client-side validation as page count is server-side

        if (type === "photo" && file.size > MAX_PHOTO_SIZE_BYTES) {
          toast.error(`Photo "${file.name}" exceeds the 2MB limit.`);
          event.target.value = null; // Clear the input
          value = null;
        } else { // No client-side size validation for 'file' type, as page count is server-side
          value = file;
        }
      } else {
        value = null;
      }
    } else {
      value = event.target.value;
    }
    setFormValues((prev) => ({ ...prev, [String(colId)]: value }));
  };

  const submitFormDataAndFinalize = async () => {
    setIsSubmitting(true); // Set submitting state
    const formData = new FormData();
    formData.append("formId", formId);

    for (const colId in formValues) {
      const column = columns.find(c => c.ColId.toString() === colId);
      if (column && (column.DataType.toLowerCase() === 'file' || column.DataType.toLowerCase() === 'photo')) {
        formData.append(colId, formValues[colId]);
      } else {
        formData.append(colId, formValues[colId]);
      }
    }

    try {
      await api.post("/formvalues/submit", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Form submitted successfully!");

      console.log("Attempting to send WhatsApp message...");
      console.log("User ID:", userId);
      console.log("Form Details:", formDetails);

      if (userId && formDetails && formDetails.formName) {
        const message = `Your form "${formDetails.formName}" has been submitted successfully.`;
        console.log("Message:", message);
        try {
          await sendWhatsAppMessage(userId, message);
          toast.success("WhatsApp notification sent.");
        } catch (whatsappError) {
          console.error("WhatsApp Error:", whatsappError);
          toast.error("Failed to send WhatsApp notification.");
        }
      } else {
        console.log("Cannot send WhatsApp message because userId or formName is missing.");
      }

      setFormValues({});
      handleOpen(true); // This opens the CustomDialog (success dialog)

    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error(err.response?.data?.message || "Failed to submit form.");
      }
      throw err; // Re-throw to be caught by caller if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (isRegistrationEnded) {
      toast.error("Registration for this form has ended and submissions are no longer accepted.");
      return;
    }
    let errors = {};
    let hasError = false;

    for (const col of columns) {
      const value = formValues[col.ColId];
      const error = validateField(col, value);
      if (error) {
        errors[col.ColId] = error;
        hasError = true;
      }
    }

    setValidationErrors(errors);

    if (hasError) {
      toast.error("Please fill out all required fields correctly.");
      return;
    }

    if (columns.length > 0 && Object.keys(formValues).length === 0) {
      toast.error("The form is empty and cannot be submitted.");
      return;
    }

    // --- Payment Logic Check ---
    const requiresPayment = formDetails?.fee > 0;
    const amountToPay = formDetails?.fee;
    const paymentDesc = `Payment for form: ${formDetails?.formName || 'N/A'}`;

    if (requiresPayment) {
      setPaymentAmount(amountToPay);
      setPaymentDescription(paymentDesc);
      setShowPaymentDialog(true); // Open payment dialog
      return; // IMPORTANT: Stop submission here, wait for payment
    }

    // If no payment required, proceed to submit form data
    try {
      await submitFormDataAndFinalize();
      // If no payment was required, and form submitted, then logout
      setTimeout(() => {
        handleLogout();
      }, 2500);
    } catch (err) {
      // Error handled in submitFormDataAndFinalize
    }
  };

  const handleDistribute = () => {
    if (isRegistrationEnded) {
      setShowRegistrationEndedDialog(true);
    } else {
      setQrDialogOpen(true);
    }
  };
  const handleCloseQrDialog = () => setQrDialogOpen(false);
  const handleCloseRegistrationEndedDialog = () => setShowRegistrationEndedDialog(false);
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link. Please copy it manually.");
    }
  };

  const formUrl = `${window.location.origin}/${formId}?formNo=${formDetails?.formNo || formNo || 1}`;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderInput = (column) => {
    const { DataType, ColumnName, ColId } = column;
    const value = formValues[ColId] || "";
    const isError = !!validationErrors[ColId];
    const errorMessage = validationErrors[ColId];
    const options = columnOptions[ColId] || [];

    switch (DataType?.toLowerCase()) {
      case "date":
        return (
          <TextField
            fullWidth
            id={ColId}
            name={ColId}
            label={ColumnName}
            value={value}
            onChange={(e) => handleInputChange(ColId, e)}
            type="date"
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            sx={{ mb: 3 }}
            required={column.IsValid}
            error={isError}
            helperText={errorMessage}
          />
        );
      case "datetime":
        return (
          <TextField
            fullWidth
            id={ColId}
            name={ColId}
            label={ColumnName}
            value={value}
            onChange={(e) => handleInputChange(ColId, e)}
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            sx={{ mb: 3 }}
            required={column.IsValid}
            error={isError}
            helperText={errorMessage}
          />
        );
      case "int":
      case "number":
      case "decimal":
        return (
          <TextField
            fullWidth
            id={ColId}
            name={ColId}
            label={ColumnName}
            value={value}
            onChange={(e) => handleInputChange(ColId, e)}
            type="number"
            variant="outlined"
            sx={{ mb: 3 }}
            required={column.IsValid}
            error={isError}
            helperText={errorMessage}
          />
        );
      case "boolean":
      case "flg":
      case "checkbox":
        return (
          <FormControl fullWidth sx={{ mb: 3 }} error={isError}>
            <FormLabel component="legend" required={column.IsValid}>{ColumnName}</FormLabel>
            {options.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    id={`${ColId}-${option}`}
                    name={ColId}
                    checked={formValues[ColId]?.includes(option) || false}
                    onChange={(e) => {
                      const currentValues = formValues[ColId] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((val) => val !== option);
                      setFormValues((prev) => ({ ...prev, [colId]: newValues }));
                    }}
                  />
                }
                label={option}
              />
            ))}
            {isError && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        );
      case "select":
        return (
          <FormControl fullWidth sx={{ mb: 3 }} error={isError}>
            <InputLabel id={`${ColId}-label`} required={column.IsValid}>{ColumnName}</InputLabel>
            <Select
              labelId={`${ColId}-label`}
              id={ColId}
              name={ColId}
              value={value}
              label={ColumnName}
              onChange={(e) => handleInputChange(ColId, e)}
              required={column.IsValid}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {isError && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        );
      case "radio":
        return (
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }} error={isError}>
            <FormLabel component="legend" required={column.IsValid}>{ColumnName}</FormLabel>
            <RadioGroup
              aria-label={ColumnName}
              name={ColId}
              value={value}
              onChange={(e) => handleInputChange(ColId, e)}
            >
              {options.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {isError && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        );
      case "textarea":
        return (
          <TextField
            fullWidth
            id={ColId}
            name={ColId}
            multiline
            rows={4}
            label={ColumnName}
            value={value}
            onChange={(e) => handleInputChange(ColId, e)}
            variant="outlined"
            sx={{ mb: 3 }}
            required={column.IsValid}
            error={isError}
            helperText={errorMessage}
          />
        );
      case 'file':
        return (
            <TextField
                fullWidth
                id={ColId}
                name={ColId}
                label={ColumnName}
                onChange={(e) => handleInputChange(ColId, e, 'file')}
                type="file"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                sx={{ mb: 3 }}
                required={column.IsValid}
                error={isError}
                helperText={errorMessage || 'Only 2-3 page PDFs allowed'}
            />
        );
      case 'photo':
        return (
            <TextField
                fullWidth
                id={ColId}
                name={ColId}
                label={ColumnName}
                onChange={(e) => handleInputChange(ColId, e, 'photo')}
                type="file"
                InputLabelProps={{ shrink: true }}
                inputProps={{ accept: 'image/*' }}
                variant="outlined"
                sx={{ mb: 3 }}
                required={column.IsValid}
                error={isError}
                helperText={errorMessage || 'Max 2MB'}
            />
        );
      default:
        return (
          <TextField
            fullWidth
            id={ColId}
            name={ColId}
            label={ColumnName}
            value={value}
            onChange={(e) => handleInputChange(ColId, e)}
            variant="outlined"
            sx={{ mb: 3 }}
            required={column.IsValid}
            error={isError}
            helperText={errorMessage}
          />
        );
    }
  };

  if (isRegistrationEnded && !isPreview) {
    return (
      <Dialog
        open={true}
        onClose={() => {}} // Prevent closing
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Registration Status</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
            <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
              Registration for this form has ended.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              The end date for this form was {formDetails?.endDate ? new Date(formDetails.endDate).toLocaleDateString() : 'N/A'}.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {isFormOnlyUser && (
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {formDetails?.formName}
            </Typography>
            {formDetails?.endDate && (
                <Typography variant="body1" sx={{ mr: 2 }}>
                    End Date: {new Date(formDetails.endDate).toLocaleDateString()}
                </Typography>
            )}
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}
      <Container
        maxWidth="md"
        sx={{ mt: isFormOnlyUser ? 0 : 4, mb: 4, pt: isFormOnlyUser ? 4 : 0 }}
      >
       {formDetails?.bannerImage && (
  <Card sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
    <Box 
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <img 
        src={formDetails.bannerImage.startsWith('http://') || formDetails.bannerImage.startsWith('https://') 
          ? formDetails.bannerImage 
          : `${api.defaults.baseURL.replace('/api', '')}${formDetails.bannerImage}`}
        alt="Banner" 
        style={{ 
          width: '100%',
          height: '150px', // Flexible height
          maxWidth: '1200px',
          objectFit: 'fill' // Show full image without cropping
        }} 
      />
    </Box>
  </Card>
)}
        <Card elevation={6} sx={{ p: 2 }}>
          <CardContent>
            {error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Box component="form" noValidate autoComplete="off" onSubmit={handleFormSubmit}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  {/* Left: Spacer to balance the logo */}
                  <Box sx={{ width: 80, flexShrink: 0 }} />

                  {/* Center: Form Name */}
                  {formDetails?.formName && (
                    <Typography variant="h4" component="h1" sx={{ flexGrow: 1, textAlign: 'center' }}>
                      {formDetails.formName}
                    </Typography>
                  )}

                  {/* Right: Logo */}
                  {formDetails?.imageOrLogo ? (
                    <Box sx={{ width: 80, height: 80, flexShrink: 0, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, p: 0.5 }}>
                      <img 
                        src={formDetails.imageOrLogo.startsWith('http://') || formDetails.imageOrLogo.startsWith('https://') 
                          ? formDetails.imageOrLogo 
                          : `${api.defaults.baseURL.replace('/api', '')}${formDetails.imageOrLogo}`}
                        alt="Form Logo" 
                        style={{ width: '100%', height: '100%', objectFit: 'fill' }} 
                      />
                    </Box>
                  ) : (
                    <Box sx={{ width: 80, flexShrink: 0 }} /> // Spacer if no logo
                  )}
                </Box>

                {isFormOnlyUser && (userId || userName) && (
                  <Box sx={{ textAlign: 'center', mb: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body1" color="text.secondary">
                      You are submitting as:
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {userName || userId}
                    </Typography>
                  </Box>
                )}

                <Box>
                  {columns.map((col) => (
                    <Box key={col.ColId}>{renderInput(col)}</Box>
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>

          {!error && (
            <CardActions
              sx={{
                display: "flex",
                justifyContent: "space-between",
                p: 2,
                borderTop: "1px solid #eee",
              }}
            >
              {isPreview ? (
                <>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate("/create-column-table")}
                  >
                    Go Back
                  </Button>
                  {isRegistrationEnded ? (
                    <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
                      Registration Ended
                    </Typography>
                  ) : (
                    <Button
                      variant="contained"
                      color="info"
                      onClick={handleDistribute}
                    >
                      Distribute
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setFormValues({})}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </>
              )}
            </CardActions>
          )}
        </Card>

        <Dialog
          open={qrDialogOpen}
          onClose={handleCloseQrDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Distribute Form</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Scan QR Code to fill the form
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Form ID: {formId}
              </Typography>
              <Typography variant="body1">
                Start Date: {formDetails?.startDate ? new Date(formDetails.startDate).toLocaleDateString() : 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                End Date: {formDetails?.endDate ? new Date(formDetails.endDate).toLocaleDateString() : 'N/A'}
              </Typography>
              <QRCodeCanvas value={formUrl} size={256} />
              <Typography variant="caption" sx={{ mt: 2 }}>
                Or share this link:
              </Typography>
              <Box sx={{ display: "flex", width: "100%", mt: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={formUrl}
                  InputProps={{ readOnly: true }}
                  sx={{ mr: 1 }}
                />
                <Button variant="outlined" onClick={handleCopyLink}>
                  Copy
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showRegistrationEndedDialog}
          onClose={handleCloseRegistrationEndedDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Registration Status</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
              <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                Registration for this form has ended.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                The end date for this form was {formDetails?.endDate ? new Date(formDetails.endDate).toLocaleDateString() : 'N/A'}.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRegistrationEndedDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage("")}
          message={successMessage}
        />
        <CustomDialog open={open} handleClose={handleClose} />

        {/* Payment Dialog */}
        <Dialog
          open={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)} // Allow closing, but payment might still be pending
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Complete Your Payment</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your form has been submitted. Please complete the payment to finalize.
            </Typography>
            <PaymentButton
              amount={paymentAmount}
              description={paymentDescription}
              userId={userId}
              formId={formId}
              formValues={formValues}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPaymentDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={registerDialogOpen}
          onClose={handleCloseRegisterDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Register for Form
            <IconButton
              aria-label="close"
              onClick={handleCloseRegisterDialog}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Register 
              setIsLoggedIn={handleRegistrationSuccess} 
              setIsFormOnlyUser={() => {}} 
            />
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
};

export default FormPage;