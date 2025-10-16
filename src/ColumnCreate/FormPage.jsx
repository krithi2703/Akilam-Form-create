import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../axiosConfig";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from 'react-toastify';
import { useDialog, CustomDialog , SocialShareDialog} from "../SideBar/MuiDialogExample";
import {
  Container,
  Box,
  Typography,
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
  DialogActions,
  useMediaQuery,
  useTheme,
  Divider
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
  Share as ShareIcon
} from "@mui/icons-material";
import Register from "../Registration/Register";
import { sendWhatsAppMessage } from "../whatsappService";
import { validateField } from "../utils/validationUtils";
import PaymentButton from '../Razor/PaymentButton';
import { RingLoader } from "react-spinners";

// Helper to read query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const FormPage = ({ isPreview = false, setIsLoggedIn, setIsFormOnlyUser }) => {
  const navigate = useNavigate();
  const { formId } = useParams();
  const query = useQuery();
  const formNo = query.get("formNo");
  const theme = useTheme();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Responsive spacing and sizing
  const responsiveSpacing = isMobile ? 2 : 3;

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDescription, setPaymentDescription] = useState('');
  const [paymentOrderId, setPaymentOrderId] = useState(null);
  const [isshareDialogOpen, setIsShareDialogOpen] = useState(false);

  const userId = sessionStorage.getItem("userId");
  const userName = sessionStorage.getItem("userName");
  const isFormOnlyUserSession = sessionStorage.getItem("isFormOnlyUser") === "true";
  const token = sessionStorage.getItem("token");

  const { open, handleOpen, handleClose } = useDialog();

  const handleLogout = () => {
    //console.log("Logout clicked - formId:", formId);
    sessionStorage.clear();
    if (setIsLoggedIn) {
      setIsLoggedIn(false);
    }
    if (setIsFormOnlyUser) {
      setIsFormOnlyUser(false);
    }
    window.location.href = `/${formId}`;
  };

  const handleCloseRegisterDialog = () => setRegisterDialogOpen(false);
  const handleRegistrationSuccess = () => {
    handleCloseRegisterDialog();
    window.location.reload();
  };

  const handleSuccessfulSubmission = async () => {
    if (isFormOnlyUserSession) {
      try {
        const contentResponse = await api.get(`/content-dtl/${formId}`);
        if (contentResponse.data && contentResponse.data.back.length > 0) {
          navigate(`/content-details/${formId}/back`);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Error checking content details after submission:", error);
        handleLogout();
      }
    } else {
      handleLogout();
    }
  };

  const handlePaymentSuccess = async (paymentId, orderId) => {
    toast.success(`Payment successful! Payment ID: ${paymentId}.`);
    setPaymentOrderId(orderId);
    setShowPaymentDialog(false);
    handleOpen();

    if (userId && formDetails && formDetails.formName) {
      const message = `Your form "${formDetails.formName}" has been submitted successfully.`;
      try {
        await sendWhatsAppMessage(userId, message);
        toast.success("WhatsApp notification sent.");
      } catch (whatsappError) {
        console.error("WhatsApp Error:", whatsappError);
        toast.error("Failed to send WhatsApp notification.");
      }
    }

    setTimeout(() => {
      handleSuccessfulSubmission();
    }, 2500);
  };

  const handlePaymentFailure = (error) => {
    toast.error(`Payment failed: ${error}`);
    setShowPaymentDialog(false);
  };

  const fetchFormAndOptions = useCallback(async () => {
    if (!formId) {
      setError("No form selected. Please go back and select a form.");
      setLoading(false);
      return;
    }

    if (!isPreview && !isFormOnlyUserSession && !token) {
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
          Validation: formValidationRulesMap.get(col.ColId) || null,
        }));

        // Filter out duplicate ColId values
        const seenColIds = new Set();
        const uniqueColumns = sortedColumns.filter(col => {
          const isDuplicate = seenColIds.has(col.ColId);
          seenColIds.add(col.ColId);
          return !isDuplicate;
        });

        setColumns(uniqueColumns);
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
          setIsRegistrationEnded(false);
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
  }, [formId, formNo, isPreview, isFormOnlyUserSession, token]);

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

    if (type === "boolean") {
      value = event.target.checked;
    } else if (type === "file" || type === "photo") {
      if (file) {
        const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024;

        if (type === "photo" && file.size > MAX_PHOTO_SIZE_BYTES) {
          toast.error(`Photo "${file.name}" exceeds the 2MB limit.`);
          event.target.value = null;
          value = null;
        } else {
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
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("formId", formId);

    for (const colId in formValues) {
      const value = formValues[colId];
      const column = columns.find(c => c.ColId.toString() === colId);

      if (column && (column.DataType.toLowerCase() === 'file' || column.DataType.toLowerCase() === 'photo')) {
        formData.append(colId, value); // File objects are handled correctly
      } else if (Array.isArray(value)) {
        // Handle arrays (e.g., from multi-select checkboxes)
        value.forEach(item => formData.append(colId, item));
      } else if (typeof value === 'boolean') {
        // Convert booleans to '1' or '0'
        formData.append(colId, value ? '1' : '0');
      }
      else {
        formData.append(colId, value); // Other values (strings, numbers)
      }
    }

    // --- ADD THIS CONSOLE.LOG ---
    //console.log("FormData being sent:");
    for (let pair of formData.entries()) {
      //console.log(pair[0]+ ': ' + pair[1]); 
    }
    // --- END ADDITION ---

    try {
      await api.post("/formvalues/submit", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Form submitted successfully!");
      setFormValues({});
      handleOpen(true);

      // Secondary actions that can run in the background or have their own loading indicators
      // Do NOT await these if they are not critical for the immediate UI response
      if (userId && formDetails && formDetails.formName) {
        const message = `Your form "${formDetails.formName}" has been submitted successfully.`;
        // Do not await sendWhatsAppMessage here to prevent blocking the UI reset
        sendWhatsAppMessage(userId, message)
          .then(() => toast.success("WhatsApp notification sent."))
          .catch((whatsappError) => {
            console.error("WhatsApp Error:", whatsappError);
            toast.error("Failed to send WhatsApp notification.");
          });
      }

    } catch (err) {
      if (err.response) {
        console.error("Backend Error Response:", err.response.data);
        console.error("Backend Error Status:", err.response.status);
        console.error("Backend Error Headers:", err.response.headers);
        toast.error(err.response.data?.message || "Failed to submit form. Check console for details.");
      } else if (err.request) {
        console.error("No response received:", err.request);
        toast.error("No response from server. Check network connection.");
      } else {
        console.error("Error setting up request:", err.message);
        toast.error("An unexpected error occurred. Check console for details.");
      }
      throw err;
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

    // Payment Logic Check
    const requiresPayment = formDetails?.fee > 0;
    const amountToPay = formDetails?.fee;
    const paymentDesc = `Payment for form: ${formDetails?.formName || 'N/A'}`;

    if (requiresPayment) {
      setPaymentAmount(amountToPay);
      setPaymentDescription(paymentDesc);
      setShowPaymentDialog(true);
      return;
    }

    // If no payment required, proceed to submit form data
    try {
      await submitFormDataAndFinalize();
      setTimeout(() => {
        handleSuccessfulSubmission();
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

  const handleOpenShareDialog = () => {
    setIsShareDialogOpen(true);
  };

  const handleCloseShareDialog = () => {
    setIsShareDialogOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const formUrl = `${window.location.origin}/${formId}?formNo=${formDetails?.formNo || formNo || 1}`;

  if (loading) {
    return (
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        padding: 2
      }}>
        <RingLoader color="#36d7b7" />
      </Box>
    );
  }

  const renderInput = (column) => {

    const { DataType, ColumnName, ColId } = column;
    const value = formValues[ColId] || "";
    const isError = !!validationErrors[ColId];
    const errorMessage = validationErrors[ColId];
    const options = columnOptions[ColId] || [];

    // Responsive spacing and sizing
    const responsiveSpacing = isMobile ? 2 : 3;
    const responsiveFontSize = isMobile ? '0.875rem' : '1rem';

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
            InputLabelProps={{
              shrink: true,
              sx: { fontSize: responsiveFontSize }
            }}
            InputProps={{
              readOnly: column.IsReadOnly,
              sx: { fontSize: responsiveFontSize }
            }} variant="outlined"
            sx={{ mb: responsiveSpacing }}
            required={column.IsValid}
            error={isError}
            helperText={errorMessage}
            size={isMobile ? "small" : "medium"}
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
            InputLabelProps={{
              shrink: true,
              sx: { fontSize: responsiveFontSize }
            }}
            InputProps={{
              readOnly: column.IsReadOnly,
              sx: { fontSize: responsiveFontSize }
            }} variant="outlined"
            sx={{ mb: responsiveSpacing }}
            required={column.IsValid}
            error={isError}
            helperText={errorMessage}
            size={isMobile ? "small" : "medium"}
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
            sx={{ mb: responsiveSpacing }}
            required={column.IsValid}
            error={isError}
            helperText={errorMessage}
            InputProps={{
              readOnly: column.IsReadOnly,
              sx: { fontSize: responsiveFontSize }
            }}
            InputLabelProps={{
              sx: { fontSize: responsiveFontSize }
            }}
            size={isMobile ? "small" : "medium"}
          />
        );
      case "boolean":
      case "flg":
        return (
          <FormControlLabel
            control={
              <Checkbox
                id={ColId}
                name={ColId}
                checked={!!formValues[ColId]} // Convert to boolean
                onChange={(e) => handleInputChange(ColId, e, 'boolean')} // Use handleInputChange for boolean
                size={isMobile ? "small" : "medium"}
                disabled={column.IsReadOnly}
              />
            }
            label={
              <Typography sx={{ fontSize: responsiveFontSize }}>
                {ColumnName}
              </Typography>
            }
            sx={{ mb: responsiveSpacing }}
            required={column.IsValid}
            error={isError}
            helperText={errorMessage}
          />
        );
      case "checkbox": // This case is for multi-select checkboxes
        return (
          <FormControl fullWidth sx={{ mb: responsiveSpacing }} error={isError}>
            <FormLabel
              component="legend"
              required={column.IsValid}
              sx={{ fontSize: responsiveFontSize }}
            >
              {ColumnName}
            </FormLabel>
            <Box sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              flexWrap: 'wrap',
              gap: 1
            }}>
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
                        setFormValues((prev) => ({ ...prev, [ColId]: newValues }));
                      }}
                      size={isMobile ? "small" : "medium"}
                      disabled={column.IsReadOnly}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: responsiveFontSize }}>
                      {option}
                    </Typography>
                  }
                />
              ))}
            </Box>
            {isError && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        ); case "select":
        return (
          <FormControl fullWidth sx={{ mb: responsiveSpacing }} error={isError}>
            <InputLabel
              id={`${ColId}-label`}
              required={column.IsValid}
              sx={{ fontSize: responsiveFontSize }}
            >
              {ColumnName}
            </InputLabel>
            <Select
              labelId={`${ColId}-label`}
              id={ColId}
              name={ColId}
              value={value}
              label={ColumnName}
              onChange={(e) => handleInputChange(ColId, e)}
              required={column.IsValid}
              size={isMobile ? "small" : "medium"}
              sx={{ fontSize: responsiveFontSize }}
              disabled={column.IsReadOnly} // <--- Add this
            >
              {options.map((option) => (
                <MenuItem
                  key={option}
                  value={option}
                  sx={{ fontSize: responsiveFontSize }}
                >
                  {option}
                </MenuItem>
              ))}
            </Select>
            {isError && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        );
      case "radio":
        return (
          <FormControl component="fieldset" fullWidth sx={{ mb: responsiveSpacing }} error={isError}>
            <FormLabel
              component="legend"
              required={column.IsValid}
              sx={{ fontSize: responsiveFontSize }}
            >
              {ColumnName}
            </FormLabel>
            <RadioGroup
              aria-label={ColumnName}
              name={ColId}
              value={value}
              onChange={(e) => handleInputChange(ColId, e)}
              disabled={column.IsReadOnly} // <--- Add this
            >
              {options.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio size={isMobile ? "small" : "medium"} />} // Changed to small/medium based on isMobile
                  label={
                    <Typography sx={{ fontSize: responsiveFontSize }}>
                      {option}
                    </Typography>
                  }
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
            label={ColumnName}
            multiline
            rows={4}
            InputProps={{
              readOnly: column.IsReadOnly,
              sx: { fontSize: responsiveFontSize }
            }}
            InputLabelProps={{
              sx: { fontSize: responsiveFontSize }
            }}
            size={isMobile ? "small" : "medium"}
            required={column.IsValid}
            error={isError}
            helperText={errorMessage || (column.Validation === 'Text Field: Max 5000 Characters (approx. 2 pages)' ? 'Max 5000 Characters (approx. 2 pages)' : '')}
            value={value}
            onChange={(e) => handleInputChange(ColId, e)}
            sx={{ mb: responsiveSpacing }}
          />);
      case "file":
        return (
          <TextField
            fullWidth
            id={ColId}
            name={ColId}
            label={ColumnName}
            onChange={(e) => handleInputChange(ColId, e, 'file')}
            type="file"
            InputLabelProps={{
              shrink: true,
              sx: { fontSize: responsiveFontSize }
            }}
            InputProps={{
              readOnly: column.IsReadOnly,
            }}
            variant="outlined" sx={{ mb: responsiveSpacing }}
            required={column.IsValid}
            error={isError}
            helperText={errorMessage || 'Only 1 or 2 page PDFs allowed'}
            size={isMobile ? "small" : "medium"}
          />
        );
      case "photo":
        return (
          <TextField
            fullWidth
            id={ColId}
            name={ColId}
            label={ColumnName}
            onChange={(e) => handleInputChange(ColId, e, 'photo')}
            type="file"
            InputLabelProps={{
              shrink: true,
              sx: { fontSize: responsiveFontSize }
            }}
            InputProps={{
              readOnly: column.IsReadOnly,
            }}
            inputProps={{ accept: 'image/*' }}
            variant="outlined" sx={{ mb: responsiveSpacing }}
            required={column.IsValid}
            error={isError}
            helperText={errorMessage || 'Max 2MB'}
            size={isMobile ? "small" : "medium"}
          />
        );
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        return (
          <Typography
            key={ColId}
            variant={DataType.toLowerCase()}
            sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}
          >
            {ColumnName}
          </Typography>
        );
      case "p":
        return (
          <Typography
            key={ColId}
            variant="body1"
            sx={{ mb: responsiveSpacing }}
          >
            {ColumnName}
          </Typography>
        );

      default:
        return (
          <TextField
            fullWidth
            id={ColId}
            name={ColId}
            label={ColumnName}
            onChange={(e) => {
              console.log('Textarea onChange fired for ColId:', ColId, ', value:', e.target.value);
              handleInputChange(ColId, e);
            }}
            sx={{ mb: responsiveSpacing }}
            required={column.IsValid}
            error={isError}
            helperText={errorMessage || (column.Validation === 'Text Field: Max 5000 Characters (approx. 2 pages)' ? 'Max 5000 Characters (approx. 2 pages)' : '')}
            InputProps={{
              readOnly: column.IsReadOnly,
              sx: { fontSize: responsiveFontSize }
            }}
            InputLabelProps={{
              sx: { fontSize: responsiveFontSize }
            }}
            size={isMobile ? "small" : "medium"}
          />
        );
    }
  };

  if (isRegistrationEnded && !isPreview) {
    return (
      <Dialog
        open={true}
        onClose={() => { }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
          Registration Status
        </DialogTitle>
        <DialogContent>
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: isMobile ? 1 : 2
          }}>
            <Typography
              variant="h6"
              color="error"
              sx={{
                fontWeight: 'bold',
                fontSize: isMobile ? '1rem' : '1.25rem',
                textAlign: 'center'
              }}
            >
              Registration for this form has ended.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                textAlign: 'center'
              }}
            >
              The end date for this form was {formDetails?.endDate ? new Date(formDetails.endDate).toLocaleDateString() : 'N/A'}.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {isFormOnlyUserSession && (
        <AppBar position="static">
          <Toolbar sx={{
            minHeight: { xs: '56px', sm: '64px' },
            padding: { xs: '0 8px', sm: '0 16px' }
          }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open menu"
                edge="start"
                onClick={toggleMobileMenu}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              {formDetails?.formName}
            </Typography>

            {!isMobile && formDetails?.endDate && (
              <Typography
                variant="body1"
                sx={{
                  mr: 2,
                  fontSize: '0.875rem'
                }}
              >
                End Date: {new Date(formDetails.endDate).toLocaleDateString()}
              </Typography>
            )}

            <IconButton
              color="inherit"
              onClick={handleLogout}
              aria-label="logout"
              size={isMobile ? "small" : "medium"}
            >
              <LogoutIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </Toolbar>

          {/* Mobile menu for additional info */}
          {isMobile && mobileMenuOpen && (
            <Box sx={{
              backgroundColor: 'primary.dark',
              padding: 2,
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              {formDetails?.endDate && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'white',
                    textAlign: 'center'
                  }}
                >
                  End Date: {new Date(formDetails.endDate).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          )}
        </AppBar>
      )}

      <Container
        maxWidth="md"
        sx={{
          mt: isFormOnlyUserSession ? 0 : { xs: 2, sm: 4 },
          mb: { xs: 2, sm: 4 },
          pt: isFormOnlyUserSession ? { xs: 2, sm: 4 } : 0,
          px: { xs: 1, sm: 2 }
        }}
      >
        {formDetails?.bannerImage && (
          <Card sx={{
            mb: 2,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 2
          }}>
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
                  height: isMobile ? '120px' : isTablet ? '140px' : '150px',
                  maxWidth: '1200px',
                  objectFit: 'fill'
                }}
              />
            </Box>
          </Card>
        )}

        <Card
          elevation={isMobile ? 2 : 6}
          sx={{
            p: { xs: 1, sm: 2 },
            borderRadius: 2
          }}
        >
          <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
            {error ? (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  '& .MuiAlert-message': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              >
                {error}
              </Alert>
            ) : (
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={handleFormSubmit}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: { xs: 2, sm: 4 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  {/* Left: Logo or Spacer */}
                  <Box sx={{
                    width: { xs: '60px', sm: '80px' },
                    height: { xs: '60px', sm: '80px' },
                    flexShrink: 0,
                    order: { xs: 2, sm: 1 }
                  }}>
                    {formDetails?.imageOrLogo ? (
                      <Box sx={{
                        width: '100%',
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'grey.300',
                        borderRadius: 1,
                        p: 0.5
                      }}>
                        <img
                          src={formDetails.imageOrLogo.startsWith('http://') || formDetails.imageOrLogo.startsWith('https://')
                            ? formDetails.imageOrLogo
                            : `${api.defaults.baseURL.replace('/api', '')}${formDetails.imageOrLogo}`}
                          alt="Form Logo"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'fill'
                          }}
                        />
                      </Box>
                    ) : (
                      <Box sx={{ width: '100%', flexShrink: 0 }} />
                    )}
                  </Box>

                  {/* Center: Form Name */}
                  {formDetails?.formName && (
                    <Box sx={{
                      flexGrow: 1,
                      textAlign: 'center',
                      order: { xs: 1, sm: 2 },
                      px: { xs: 1, sm: 0 }
                    }}>
                      <Typography
                        variant="h5"
                        component="h1"
                        sx={{
                          display: 'inline-block',
                          paddingBottom: '0.5rem',
                          background: 'linear-gradient(to right, #667eea, #764ba2)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                          fontWeight: 'bold',
                          lineHeight: 1.2
                        }}
                      >
                        {formDetails.formName}
                      </Typography>
                    </Box>
                  )}

                  {/* Right: Spacer for balance */}
                  <Box sx={{
                    width: { xs: '60px', sm: '80px' },
                    flexShrink: 0,
                    order: { xs: 3, sm: 3 }
                  }} />
                </Box>

                {isFormOnlyUserSession && (userId || userName) && (
                  <Box sx={{
                    textAlign: 'center',
                    mb: 3,
                    p: { xs: 1, sm: 2 },
                    backgroundColor: 'grey.100',
                    borderRadius: 1
                  }}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      You are submitting as:
                    </Typography>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        fontWeight: 'bold'
                      }}
                    >
                      {userName || userId}
                    </Typography>
                  </Box>
                )}

                <Box>
                  {columns.map((col, index) => {
                    const isHeading = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(col.DataType?.toLowerCase());
                    return (
                      <Box key={col.ColId}>{renderInput(col)}</Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </CardContent>

          {!error && (
            <CardActions
              sx={{
                display: "flex",
                justifyContent: "space-between",
                p: { xs: 1, sm: 2 },
                borderTop: "1px solid #eee",
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 }
              }}
            >
              {isPreview ? (
                <>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate("/create-column-table")}
                    fullWidth={isMobile}
                    size={isMobile ? "small" : "medium"}
                  >
                    Go Back
                  </Button>
                  {isRegistrationEnded ? (
                    <Typography
                      variant="body2"
                      color="error"
                      sx={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        width: '100%'
                      }}
                    >
                      Registration Ended
                    </Typography>
                  ) : (
                    <Button
                      variant="contained"
                      color="info"
                      onClick={handleDistribute}
                      fullWidth={isMobile}
                      size={isMobile ? "small" : "medium"}
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
                    fullWidth={isMobile}
                    size={isMobile ? "small" : "medium"}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    fullWidth={isMobile}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      minWidth: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    {isSubmitting ? (
                      <RingLoader color="white" size={24} />
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </>
              )}
            </CardActions>
          )}
        </Card>

        {/* QR Dialog */}
        <Dialog
          open={qrDialogOpen}
          onClose={handleCloseQrDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              m: { xs: 1, sm: 2 },
              maxWidth: { xs: 'calc(100% - 16px)', sm: 'md' }
            }
          }}
        >
          <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Distribute Form
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: { xs: 1, sm: 2 },
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Scan QR Code to fill the form
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, textAlign: 'center' }}>
                Form ID: {formId}
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'center' }}>
                Start Date: {formDetails?.startDate ? new Date(formDetails.startDate).toLocaleDateString() : 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                End Date: {formDetails?.endDate ? new Date(formDetails.endDate).toLocaleDateString() : 'N/A'}
              </Typography>
              <QRCodeCanvas
                value={formUrl}
                size={isMobile ? 200 : 256}
              />
              <Typography variant="caption" sx={{ mt: 2, textAlign: 'center' }}>
                Or share this link:
              </Typography>
              <Box sx={{
                display: "flex",
                width: "100%",
                mt: 1,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 }
              }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={formUrl}
                  InputProps={{ readOnly: true }}
                  sx={{ mr: { xs: 0, sm: 1 } }}
                  size={isMobile ? "small" : "medium"}
                />
                <Button
                  variant="outlined"
                  onClick={handleOpenShareDialog}
                  startIcon={<ShareIcon />}
                  sx={{
                    minWidth: { xs: '100%', sm: 'auto' },
                    mt: { xs: 1, sm: 0 }
                  }}
                >
                  Share
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Registration Ended Dialog */}
        <Dialog
          open={showRegistrationEndedDialog}
          onClose={handleCloseRegistrationEndedDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              m: { xs: 1, sm: 2 }
            }
          }}
        >
          <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Registration Status
          </DialogTitle>
          <DialogContent>
            <Box sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: { xs: 1, sm: 2 }
            }}>
              <Typography
                variant="h6"
                color="error"
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  textAlign: 'center'
                }}
              >
                Registration for this form has ended.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  textAlign: 'center'
                }}
              >
                The end date for this form was {formDetails?.endDate ? new Date(formDetails.endDate).toLocaleDateString() : 'N/A'}.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
            <Button
              onClick={handleCloseRegistrationEndedDialog}
              color="primary"
              size={isMobile ? "small" : "medium"}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage("")}
          message={successMessage}
          anchorOrigin={{
            vertical: isMobile ? 'bottom' : 'top',
            horizontal: 'center'
          }}
        />

        <CustomDialog open={open} handleClose={handleClose} />

        {/* Payment Dialog */}
        <Dialog
          open={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              m: { xs: 1, sm: 2 }
            }
          }}
        >
          <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Complete Your Payment
          </DialogTitle>
          <DialogContent>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
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
          <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
            <Button
              onClick={() => setShowPaymentDialog(false)}
              size={isMobile ? "small" : "medium"}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Registration Dialog */}
        <Dialog
          open={registerDialogOpen}
          onClose={handleCloseRegisterDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              m: { xs: 1, sm: 2 }
            }
          }}
        >
          <DialogTitle
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pr: { xs: 6, sm: 8 }
            }}
          >
            Register for Form
            <IconButton
              aria-label="close"
              onClick={handleCloseRegisterDialog}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
              size={isMobile ? "small" : "medium"}
            >
              <CloseIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
            <Register
              setIsLoggedIn={handleRegistrationSuccess}
              setIsFormOnlyUser={() => { }}
            />
          </DialogContent>
        </Dialog>

        {/* Social Share Dialog */}
        <SocialShareDialog
          open={isshareDialogOpen}
          handleClose={handleCloseShareDialog}
          shareUrl={formUrl}
          title={formDetails?.formName || "Check out this form!"}
        />
      </Container>
    </>
  );
};

export default FormPage;
