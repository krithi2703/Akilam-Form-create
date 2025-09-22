import React, { useState, useEffect } from "react";
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
  IconButton
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon
} from "@mui/icons-material";

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

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const isFormOnlyUser = sessionStorage.getItem("isFormOnlyUser") === "true";
  const token = sessionStorage.getItem("token"); // Get token


  const { open, handleOpen, handleClose } = useDialog();
  const handleLogout = () => {
    
    setTimeout(() => {
      localStorage.clear();
      navigate(`/${formId}`, { replace: true });
    }, 3000);
  };

  // ---------------- Fetch Form Layout ----------------
  useEffect(() => {
    if (!formId) {
      setError("No form selected. Please go back and select a form.");
      setLoading(false);
      return;
    }

    // Form-only users don't need a token, but others do.
    if (!isPreview && !isFormOnlyUser && !token) {
      setError("You must be logged in to view this page.");
      setLoading(false);
      return;
    }

    const fetchFormLayout = async () => {
      try {
        setLoading(true);

        let url = `/formdetails/user/form-columns?formId=${formId}`;
        if (formNo) {
          url += `&formNo=${formNo}`;
        }

        // The interceptor handles Authorization header.
        // For preview, we may need to pass a special header if the interceptor doesn't handle it.
        const headers = {};
        if (isPreview) {
          headers.userid = "preview";
        }

        const response = await api.get(url, { headers });

        if (response.data && response.data.length > 0) {
          const sortedColumns = response.data.sort(
            (a, b) => a.SequenceNo - b.SequenceNo
          );
          setColumns(sortedColumns);
          setFormDetails({
            formName: sortedColumns[0].FormName,
            formNo: sortedColumns[0].FormNo,
            endDate: sortedColumns[0].Enddate, // Add Enddate here
            startDate: sortedColumns[0].Startdate, // Add Startdate here
          });
          console.log("Form Details fetched:", {
            formId: formId,
            formNo: sortedColumns[0].FormNo,
            startDate: sortedColumns[0].Startdate,
            endDate: sortedColumns[0].Enddate,
          });
          console.log("Raw Start Date from backend:", sortedColumns[0].Startdate);
          console.log("Raw End Date from backend:", sortedColumns[0].Enddate);
        } else {
          setError("No columns found for this form version.");
        }
      } catch (err) {
        // The interceptor will handle token expiration.
        // We can still show a generic error for other cases.
        if (err.response?.status !== 401 && err.response?.status !== 403) {
          console.error("Error fetching form layout:", err);
          toast.error(err.response?.data?.message || "Failed to fetch form layout.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFormLayout();
  }, [formId, formNo, userId, isPreview, isFormOnlyUser, token]); // Added token to dependency array

  // ---------------- Input Change ----------------
  const handleInputChange = (colId, event, type) => {
    const value =
      type === "checkbox" ? event.target.checked : event.target.value;
    setFormValues((prev) => ({ ...prev, [colId]: value }));
  };

  // ---------------- Submit Form ----------------
  const handleSubmit = async () => {

    // Basic validation: ensure all fields have a value.
    for (const col of columns) {
      const value = formValues[col.ColId];
      // Check for undefined, null, or empty string.
      // Allows `false` for checkboxes and `0` for numbers.
      if (value === undefined || value === null || value === "") {
        toast.error(`Please fill out the "${col.ColumnName}" field.`);
        return; // Stop submission
      }
    }

    // Also, check if the form is completely empty, even if there are no columns.
    if (columns.length > 0 && Object.keys(formValues).length === 0) {
      toast.error("The form is empty and cannot be submitted.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Interceptor handles headers
      await api.post(
        "/formvalues/submit",
        {
          formId,
          values: formValues,
        }
      );



      toast.success("Form submitted successfully!");
      setFormValues({});
handleOpen(true);
      // ✅ Always go to /view-submissions
      setTimeout(() => {
      handleLogout()
      }, 2500);
    } catch (err) {
      // Interceptor will handle token expiration.
      // We can still show a generic error for other cases.
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error(err.response?.data?.message || "Failed to submit form.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- QR Handling ----------------
  const handleDistribute = () => setQrDialogOpen(true);
  const handleCloseQrDialog = () => setQrDialogOpen(false);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(formUrl);
    toast.success("Link copied to clipboard!");
  };

  const formUrl = `${window.location.origin}/${formId}?formNo=${formDetails?.formNo || formNo || 1
    }`;


  // ---------------- Loading Spinner ----------------
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ---------------- Render Input by Type ----------------
  const renderInput = (column) => {
    const { DataType, ColumnName, ColId, Options } = column;
    const value = formValues[ColId] || "";

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
                checked={!!value}
                onChange={(e) => handleInputChange(ColId, e, "checkbox")}
              />
            }
            label={ColumnName}
            sx={{ mb: 2 }}
          />
        );
      case "dropdown":
        const options = Options ? Options.split(',') : [];
        return (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id={`${ColId}-label`}>{ColumnName}</InputLabel>
            <Select
              labelId={`${ColId}-label`}
              id={ColId}
              name={ColId}
              value={value}
              label={ColumnName}
              onChange={(e) => handleInputChange(ColId, e)}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option.trim()}>
                  {option.trim()}
                </MenuItem>
              ))}
            </Select>
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
          />
        );
    }
  };

  // ---------------- Render Page ----------------
  return (
    <>
      {isFormOnlyUser && (
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {formDetails?.formName}
            </Typography>
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
        <Card elevation={6} sx={{ p: 2 }}>
          <CardContent>
            {error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Box component="form" noValidate autoComplete="off">
                {formDetails?.formName && (
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ textAlign: "center", mb: 4 }}
                  >
                    {formDetails.formName}
                  </Typography>
                )}

                {isFormOnlyUser && (userId || userName) && ( // Check for userId or userName
                  <Box sx={{ textAlign: 'center', mb: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body1" color="text.secondary">
                      You are submitting as:
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {userName || userId} {/* Display userName if available, else userId */}
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
                  <Button
                    variant="contained"
                    color="info"
                    onClick={handleDistribute}
                  >
                    Distribute
                  </Button>
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

        {/* QR Dialog */}
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

        {/* Success Message */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage("")}
          message={successMessage}
        />
        <CustomDialog open={open} handleClose={handleClose} />
      </Container>
    </>
  );
};

export default FormPage;