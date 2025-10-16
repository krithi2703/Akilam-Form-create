import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import api from "../axiosConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { RingLoader } from "react-spinners";

export default function MasterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formId, setFormId] = useState(null);
  const [formName, setFormName] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [enddate, setEnddate] = useState("");
  const [fee, setFee] = useState("");
  const [imageorlogo, setImageorlogo] = useState(""); // Stores the URL/path from backend
  const [selectedFile, setSelectedFile] = useState(null); // Stores the file object for upload
  const [imagePreviewUrl, setImagePreviewUrl] = useState(""); // Stores URL for image preview
  const [activeStatus, setActiveStatus] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formNameError, setFormNameError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isSubmitting = useRef(false);
  const isMounted = useRef(true); // Ref to track mount status

  // Cleanup function for image preview URL
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      isMounted.current = false; // Set to false on unmount
    };
  }, [imagePreviewUrl]);

  // ✅ Read user details from sessionStorage
  const userName = sessionStorage.getItem("userName");
  const userId = sessionStorage.getItem("userId");

  // ---------------- Check authentication on component mount ----------------
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated. Please log in.");
      navigate("/login");
      return;
    }

    const params = new URLSearchParams(location.search);
    const editId = params.get("editId");

    if (editId) {
      setFormId(editId);
      fetchForm(editId);
    } else {
      const today = new Date().toISOString().split("T")[0];
      setCreatedDate(today);
    }

    return () => { isMounted.current = false; }; // Cleanup on unmount
  }, [location.search, navigate]);

  // ---------------- Fetch form details for editing ----------------
  const fetchForm = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/formmaster/${id}`);

      if (isMounted.current && res.status === 200) {
        const form = res.data;
        setFormName(form.FormName);
        setCreatedDate(form.CreatedDate ? new Date(form.CreatedDate).toISOString().split('T')[0] : '');
        setEnddate(form.Enddate ? new Date(form.Enddate).toISOString().split('T')[0] : '');
        setFee(form.Fee || "");
        setImageorlogo(form.ImageOrLogo || ""); // Populate with existing URL
        setImagePreviewUrl(form.ImageOrLogo ? (form.ImageOrLogo.startsWith('http://') || form.ImageOrLogo.startsWith('https://') ? form.ImageOrLogo : `${api.defaults.baseURL.replace('/api', '')}${form.ImageOrLogo}`) : ""); // Set preview if URL exists
        setActiveStatus(form.Active);
      }
    } catch (err) {
      console.error("Fetch form error:", err);
      if (isMounted.current) {
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          sessionStorage.clear();
          navigate("/login");
        } else {
          toast.error(err.response?.data?.error || "Failed to fetch form for editing");
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // ---------------- Handle file selection ----------------
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file)); // Create a URL for preview
    } else {
      setSelectedFile(null);
      setImagePreviewUrl("");
    }
  };

  // ---------------- Handle image upload to backend ----------------
  const handleUploadImage = async () => {
    if (!selectedFile) return null; // No file to upload

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await api.post("/formmaster/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.filePath; // Return the path from the backend
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Failed to upload image.");
      return null;
    }
  };

  // ---------------- Validate form ----------------
  const validateForm = () => {
    let isValid = true;

    if (!formName.trim()) {
      setFormNameError("Form Name is required.");
      isValid = false;
    } else {
      setFormNameError("");
    }

    if (!createdDate) {
      toast.error("Created Date is required.");
      isValid = false;
    }

    if (createdDate && enddate && new Date(enddate) < new Date(createdDate)) {
      toast.error("End Date cannot be before Created Date.");
      isValid = false;
    }

    return isValid;
  };

  // ---------------- Handle form submit ----------------
  const handleSubmit = async () => {
    if (isSubmitting.current) return;
    if (!validateForm()) return;

    isSubmitting.current = true;
    setLoading(true);

    let uploadedImagePath = imageorlogo; // Start with existing image path

    if (selectedFile) {
      // If a new file is selected, upload it first
      uploadedImagePath = await handleUploadImage();
      if (!uploadedImagePath) {
        // If upload failed, stop submission
        setLoading(false);
        isSubmitting.current = false;
        return;
      }
    }

    try {
      const formData = {
        formName: formName.trim(),
        createdDate,
        enddate: enddate || null,
        fee: fee ? parseFloat(fee) : null,
        imageorlogo: uploadedImagePath, // Use the uploaded path or existing one
        // ⚠️ No need to send UserId here — backend reads from token
      };

      if (formId) {
        const res = await api.put(`/formmaster/${formId}`, formData);
        if (res.status === 200) {
          toast.success("Form updated successfully!");
          navigate("/mastertable");
        }
      } else {
        const res = await api.post("/formmaster", formData);
        if (res.status === 201) {
          toast.success("Form submitted successfully!");
          // Navigate to CreateColumnTable for the newly created form
          navigate("/mastertable", {
            state: {
              formId: res.data.FormId, // Assuming FormId is in res.data
              formName: res.data.FormName, // Assuming FormName is in res.data
              formNo: 1, // Assuming initial form number is 1 for a new form
            },
          });
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        sessionStorage.clear();
        navigate("/login");
      } else {
        toast.error(err.response?.data?.error || "Error submitting form");
      }
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  // ---------------- Soft delete ----------------
  const handleSoftDelete = async () => {
    try {
      setLoading(true);
      const res = await api.put(`/formmaster/soft-delete/${formId}`);

      if (res.status === 200) {
        toast.success("Form soft deleted successfully!");
        setDeleteDialogOpen(false);
        navigate("/mastertable");
      }
    } catch (err) {
      console.error("Delete error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        sessionStorage.clear();
        navigate("/login");
      } else {
        toast.error(err.response?.data?.error || "Failed to delete form");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" p={2}>
      <Card sx={{ width: "100%", maxWidth: 500, borderRadius: "16px", boxShadow: 3 }}>
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            {formId ? "Edit Form" : "Form Master"}
          </Typography>

          {activeStatus === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This form has been deactivated and cannot be edited.
            </Alert>
          )}

          <Stack spacing={2} sx={{ width: "100%" }}>
            <TextField
              label="Form Name"
              fullWidth
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value);
                if (e.target.value.trim()) {
                  setFormNameError("");
                }
              }}
              required
              error={!!formNameError}
              helperText={formNameError}
              disabled={activeStatus === 0 || loading}
            />

            {/* ✅ Show Username, not UserId */}
            <TextField
              label="User"
              fullWidth
              value={userName || ""}
              InputProps={{ readOnly: true }}
              disabled={loading}
            hidden/>

            <TextField
              label="Created Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={createdDate}
              onChange={(e) => setCreatedDate(e.target.value)}
              required
              disabled={activeStatus === 0 || loading}
            />

            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={enddate}
              onChange={(e) => setEnddate(e.target.value)}
              disabled={activeStatus === 0 || loading}
            />

            <TextField
              label="Fee"
              type="number"
              fullWidth
              value={fee}
              onChange={(e) => setFee(e.target.value.replace(/[^0-9.]/g, ""))}
              inputProps={{ min: 0, step: 0.01 }}
              disabled={activeStatus === 0 || loading}
            />

            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              multiple
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Button variant="outlined" component="span" fullWidth disabled={activeStatus === 0 || loading}>
                {selectedFile ? selectedFile.name : "Upload Image/Logo"}
              </Button>
            </label>
            {imagePreviewUrl && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img src={imagePreviewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading || activeStatus === 0}
              onClick={handleSubmit}
            >
              {loading ? <RingLoader color="white" size={24} /> : formId ? "Update" : "Submit"}
            </Button>

            {formId && activeStatus === 1 && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={() => setDeleteDialogOpen(true)}
                disabled={loading}
              >
                Soft Delete
              </Button>
            )}

            <Button
              variant="text"
              color="secondary"
              fullWidth
              onClick={() => navigate("/formtable")}
              disabled={loading}
            >
              Back to List
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !loading && setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Soft Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to soft delete this form? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSoftDelete}
            color="error"
            disabled={loading}
            startIcon={loading && <RingLoader color="white" size={16} />}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}