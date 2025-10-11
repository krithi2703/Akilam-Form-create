import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Checkbox,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  Divider,
  CardHeader,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Add as AddIcon, 
  Close as CloseIcon, 
  Rule as RuleIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import api from '../axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ColumnOptionEditorDialog from './ColumnOptionEditorDialog';

// Enhanced ValidationRuleDialog with better styling
const ValidationRuleDialog = ({ open, onClose, onSave, validationOptions, initialValue }) => {
  const [selectedValue, setSelectedValue] = useState(initialValue || '');

  useEffect(() => {
    setSelectedValue(initialValue || '');
  }, [initialValue, open]);

  const handleSave = () => {
    onSave(selectedValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        py: 2
      }}>
        <Box display="flex" alignItems="center">
          <RuleIcon sx={{ mr: 1 }} />
          Set Validation Rule
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="validation-select-label">Select Validation Rule</InputLabel>
          <Select
            labelId="validation-select-label"
            value={selectedValue}
            label="Select Validation Rule"
            onChange={(e) => setSelectedValue(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'grey.300',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          >
            <MenuItem value="">
              <em>No Validation</em>
            </MenuItem>
            {validationOptions.map((option) => (
              <MenuItem key={option.Id} value={option.Id}>
                {option.ValidationList}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            px: 3
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          startIcon={<CheckCircleIcon />}
          sx={{ 
            borderRadius: 2,
            px: 3
          }}
        >
          Save Rule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const FormDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formId, formNo } = location.state || {};
  const [formName, setFormName] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreviewUrl, setBannerImagePreviewUrl] = useState("");
  const [currentForm, setCurrentForm] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [existingColumns, setExistingColumns] = useState([]);
  const [allColumns, setAllColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [sequences, setSequences] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [sequenceErrors, setSequenceErrors] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempSelectedColumns, setTempSelectedColumns] = useState([]);
  const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);
  const [selectedColForOptions, setSelectedColForOptions] = useState(null);
  const [existingColumnIds, setExistingColumnIds] = useState([]);

  // --- New State for Validation --- 
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedColForValidation, setSelectedColForValidation] = useState(null);
  const [availableValidations, setAvailableValidations] = useState([]);
  const [columnValidations, setColumnValidations] = useState({}); // { [colId]: validationId }

  // --- New State for Info Dialog ---
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [isValidFormFront, setIsValidFormFront] = useState(false);
  const [isValidFormBack, setIsValidFormBack] = useState(false);

  const userId = sessionStorage.getItem('userId');

  const handleBannerFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBannerImageFile(file);
      setBannerImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setBannerImageFile(null);
      setBannerImagePreviewUrl("");
    }
  };

  const handleUploadBannerImage = async () => {
    if (!bannerImageFile) return null;

    const formData = new FormData();
    formData.append("image", bannerImageFile);

    try {
      // Re-using the same upload endpoint as MasterPage
      const response = await api.post("/formmaster/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.filePath;
    } catch (err) {
      console.error("Banner image upload error:", err);
      toast.error("Failed to upload banner image.");
      return null;
    }
  };

  useEffect(() => {
    if (!userId) {
      setError('You must be logged in to view this page.');
      setLoading(false);
      return;
    }

    if (!formId) {
      setLoading(false);
      setError('No Form ID provided.');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch form details
        const formsResponse = await api.get('/formmaster');
        const foundForm = formsResponse.data.find(f => f.FormId == formId);
        if (foundForm) {
          setFormName(foundForm.FormName);
          setCurrentForm(foundForm);
        } else {
          throw new Error(`Form with ID ${formId} not found.`);
        }

        // Fetch all dynamic columns
        const columnsResponse = await api.get('/columns');
        setAllColumns(columnsResponse.data);
        setAvailableColumns(columnsResponse.data);

        // Fetch columns already in this form version
        if (formId && formNo) {
          const existingColumnsResponse = await api.get(
            `/formdetails/user/form-columns?formId=${formId}&formNo=${formNo}`
          );
          setExistingColumns(existingColumnsResponse.data);
          const existingIds = existingColumnsResponse.data.map(c => c.ColId);
          setExistingColumnIds(existingIds);

          // Fetch existing banner image from FormDetails_dtl
          if (existingColumnsResponse.data.length > 0 && existingColumnsResponse.data[0].BannerImage) {
            const bannerImageUrl = existingColumnsResponse.data[0].BannerImage;
            setBannerImagePreviewUrl(bannerImageUrl.startsWith('http://') || bannerImageUrl.startsWith('https://') 
              ? bannerImageUrl 
              : `${api.defaults.baseURL.replace('/api', '')}${bannerImageUrl}`);
          } else {
            setBannerImagePreviewUrl("");
          }
        }

        // --- Fetch available validation types ---
        const validationTypesResponse = await api.get('/validation/types');
        const fetchedValidations = validationTypesResponse.data;

        // Add a placeholder validation for "2 pages only allowed" for text fields
        const twoPagesValidation = {
          Id: 'TEXT_MAX_5000_CHARS',
          ValidationList: 'Text Field: Max 5000 Characters (approx. 2 pages)'
        };
        setAvailableValidations([...fetchedValidations, twoPagesValidation]);

      } catch (err) {
        setError(err.message || 'Failed to fetch initial data.');
        toast.error(err.message || 'Failed to fetch initial data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId, userId, formNo]);

  const handleOpenDialog = () => {
    setTempSelectedColumns([...selectedColumns]);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleConfirmDialog = () => {
    setSelectedColumns([...tempSelectedColumns]);
    setDialogOpen(false);
  };

  const handleOpenOptionsDialog = (column) => {
    setSelectedColForOptions({ colId: column.ColumnId, dataType: column.DataType, columnName: column.ColumnName });
    setOptionsDialogOpen(true);
  };

  const handleCloseOptionsDialog = () => {
    if (selectedColForOptions) {
      const newSelected = tempSelectedColumns.filter(id => id !== selectedColForOptions.colId);
      setTempSelectedColumns(newSelected);
    }
    setOptionsDialogOpen(false);
    setSelectedColForOptions(null);
  };

  const handleOptionsSubmitSuccess = () => {
    setOptionsDialogOpen(false);
    setSelectedColForOptions(null);
  };

  // --- Handlers for Validation Dialog ---
  const handleOpenValidationDialog = (column) => {
    setSelectedColForValidation(column);
    setValidationDialogOpen(true);
  };

  const handleCloseValidationDialog = () => {
    if (selectedColForValidation) {
      const newSelected = tempSelectedColumns.filter(id => id !== selectedColForValidation.ColumnId);
      setTempSelectedColumns(newSelected);
    }
    setValidationDialogOpen(false);
    setSelectedColForValidation(null);
  };

  const handleSaveValidationRule = (validationId) => {
    if (selectedColForValidation) {
      setColumnValidations(prev => ({ ...prev, [selectedColForValidation.ColumnId]: validationId }));
      toast.success(`Validation set for ${selectedColForValidation.ColumnName}`);
    }
    setValidationDialogOpen(false);
    setSelectedColForValidation(null);
  };

  const handleToggleColumn = (column) => {
    const columnId = column.ColumnId;
    const currentIndex = tempSelectedColumns.indexOf(columnId);
    const newSelected = [...tempSelectedColumns];

    if (currentIndex === -1) {
      newSelected.push(columnId);
      const dataType = column.DataType?.toLowerCase();
      if (dataType === 'select' || dataType === 'radio' || dataType === 'checkbox') {
        handleOpenOptionsDialog(column);
      }
    } else {
      newSelected.splice(currentIndex, 1);
      // Also remove validation if it exists
      if (columnValidations[columnId]) {
        const newValidations = { ...columnValidations };
        delete newValidations[columnId];
        setColumnValidations(newValidations);
      }
    }
    setTempSelectedColumns(newSelected);
  };

  const handleRemoveColumn = (columnId) => {
    const newSelected = selectedColumns.filter(id => id !== columnId);
    setSelectedColumns(newSelected);

    const newSequences = { ...sequences };
    delete newSequences[columnId];
    setSequences(newSequences);

    // --- Remove validation rule as well ---
    if (columnValidations[columnId]) {
      const newValidations = { ...columnValidations };
      delete newValidations[columnId];
      setColumnValidations(newValidations);
    }
  };

  const handleSequenceChange = (colId, value) => {
    const numericValue = value === '' ? null : Number(value);
    setSequences((prev) => ({ ...prev, [colId]: numericValue }));
    if (sequenceErrors[colId]) {
      setSequenceErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[colId];
        return newErrors;
      });
    }
  };

  const handleClearValidationRule = (colId) => {
    setColumnValidations(prev => {
      const newValidations = { ...prev };
      delete newValidations[colId];
      return newValidations;
    });
    toast.info('Validation rule cleared.');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedColumns.length === 0) {
      setSubmitStatus({ type: 'warning', message: 'Please select at least one column.' });
      return;
    }

    // --- Validation logic for sequences (unchanged) ---
    const newErrors = {};
    let hasErrors = false;
    selectedColumns.forEach(colId => {
      const seq = sequences[colId];
      if (seq === null || seq === undefined || isNaN(seq)) {
        newErrors[colId] = "Sequence is required and must be a number.";
        hasErrors = true;
      } else if (Number(seq) <= 0) {
        newErrors[colId] = "Sequence must be a positive number.";
        hasErrors = true;
      }
    });
    if (hasErrors) {
      setSequenceErrors(newErrors);
      return;
    }
    const validSequenceValues = selectedColumns
      .map(colId => sequences[colId])
      .filter(seq => seq !== null && seq !== undefined && !isNaN(seq) && Number(seq) > 0);
    const sequenceCounts = validSequenceValues.reduce((acc, seq) => {
      acc[seq] = (acc[seq] || 0) + 1;
      return acc;
    }, {});
    selectedColumns.forEach(colId => {
      const seq = sequences[colId];
      if (seq !== null && seq !== undefined && !isNaN(seq) && Number(seq) > 0 && sequenceCounts[seq] > 1) {
        newErrors[colId] = "Sequence must be unique.";
        hasErrors = true;
      }
    });
    setSequenceErrors(newErrors);
    if (hasErrors) return;
    // --- End of validation logic ---

    let bannerImagePath = null;
    if (bannerImageFile) {
      setSubmitStatus({ type: 'info', message: 'Uploading banner image...' });
      bannerImagePath = await handleUploadBannerImage();
      if (!bannerImagePath) {
          setSubmitStatus({ type: 'error', message: 'Failed to upload banner image. Please try again.' });
          return;
      }
    }

    setSubmitStatus({ type: 'info', message: 'Submitting columns...' });

    const columnRequests = selectedColumns.map(colId => {
      return api.post('/formdetails/insert-formdetails', {
        formId,
        colId,
        sequenceNo: sequences[colId],
        active: 1,
        formNo: formNo,
        bannerimage: bannerImagePath,
      });
    });

    try {
      await Promise.all(columnRequests);
      toast.success('Columns added successfully!');
      setSubmitStatus({ type: 'info', message: 'Saving validation rules...' });

      // --- Now, save the validation rules ---
      const validationRequests = selectedColumns.map(colId => {
        const validationId = columnValidations[colId];
        if (validationId) {
          return api.post('/validation/insert', {
            FormId: formId,
            ColId: colId,
            Validationid: validationId,
            Active: 1,
          });
        }
        return null;
      }).filter(Boolean); // Filter out null requests

      if (validationRequests.length > 0) {
        await Promise.all(validationRequests);
        toast.success('Validation rules saved successfully!');
      }

      setSubmitStatus({ type: 'success', message: 'All details saved successfully!' });
      setSelectedColumns([]);
      setSequences({});
      setColumnValidations({}); // Clear validations
      setBannerImageFile(null);
      setBannerImagePreviewUrl("");
      
      setTimeout(() => {
        navigate('/create-column-table', { state: { formId, formNo } });
      }, 1500);

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred during submission.';
      setSubmitStatus({ type: 'error', message: errorMessage });
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Grid container spacing={4}>
        {/* Banner Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              overflow: 'visible'
            }}
          >
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  <ImageIcon sx={{ mr: 1, color: 'primary.main' }} />
                  Banner Image
                </Box>
              }
              titleTypographyProps={{ 
                variant: 'h6',
                fontWeight: 600 
              }}
              sx={{ 
                pb: 1,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)'
              }}
            />
            <CardContent>
              <Stack spacing={2} alignItems="center">
                {bannerImagePreviewUrl ? (
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: 180, 
                      border: '2px dashed',
                      borderColor: 'primary.light',
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      overflow: 'hidden',
                      bgcolor: 'grey.50',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                      }
                    }}
                  >
                    <img 
                      src={bannerImagePreviewUrl} 
                      alt="Banner Preview" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }} 
                    />
                  </Box>
                ) : (
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: 180, 
                      border: '2px dashed',
                      borderColor: 'grey.400',
                      borderRadius: 2, 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      backgroundColor: 'grey.50',
                      color: 'grey.500',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'grey.100'
                      }
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      No Banner Image
                    </Typography>
                  </Box>
                )}
                
                <label htmlFor="banner-image-upload" style={{ width: '100%' }}>
                  <Button 
                    variant={bannerImagePreviewUrl ? "outlined" : "contained"} 
                    component="span" 
                    fullWidth
                    startIcon={bannerImagePreviewUrl ? <ImageIcon /> : <AddIcon />}
                    sx={{ 
                      borderRadius: 2,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    {bannerImagePreviewUrl ? 'Change Banner Image' : 'Upload Banner Image'}
                  </Button>
                </label>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="banner-image-upload"
                  type="file"
                  onChange={handleBannerFileChange}
                />
                
                {bannerImagePreviewUrl && (
                  <Button 
                    variant="text" 
                    color="error" 
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      setBannerImageFile(null);
                      setBannerImagePreviewUrl("");
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    Remove Image
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Form Card */}
        <Grid item xs={12} md={12}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              overflow: 'visible'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                {/* Header Section */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 4,
                    pb: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box>
                    <Typography 
                      variant="h4" 
                      component="h1" 
                      fontWeight="700"
                      color="primary.main"
                      gutterBottom
                    >
                      Form Configuration
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Add and configure columns for your form
                    </Typography>
                  </Box>
                  <Tooltip title="Add form information" arrow>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => setInfoDialogOpen(true)}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        ml: 10
                      }}
                    >
                      Add Form Info
                    </Button>
                  </Tooltip>
                </Box>
               
                <Grid container spacing={3}>
                  {/* Form Name and Select Columns */}
                  <Grid item xs={12}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        borderRadius: 2,
                        borderColor: 'grey.200',
                        bgcolor: 'grey.50'
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ width: '100%' }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <TextField 
                              label="Form Name" 
                              value={formName} 
                              InputProps={{ 
                                readOnly: true,
                                sx: { 
                                  bgcolor: 'white',
                                  borderRadius: 1,
                                  overflow: 'visible'
                                }
                              }} 
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main',
                                  },
                                }
                              }}
                            hidden />
                          </Box>
                          <Tooltip title="Select columns to add to your form" arrow>
                            <Button
                              variant="contained"
                              color="secondary"
                              startIcon={<AddIcon />}
                              onClick={handleOpenDialog}
                              fullWidth
                              sx={{ 
                                whiteSpace: 'nowrap',
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                width: { xs: '100%', sm: '100%' }
                              }}
                            >
                              Select Columns
                            </Button>
                          </Tooltip>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Status Alert */}
                  {submitStatus && (
                    <Grid item xs={12}>
                      <Alert 
                        severity={submitStatus.type}
                        sx={{
                          borderRadius: 2,
                          alignItems: 'center',
                          '& .MuiAlert-message': {
                            width: '100%'
                          }
                        }}
                        action={
                          submitStatus.type === 'success' && (
                            <CheckCircleIcon color="success" />
                          )
                        }
                      >
                        <Typography fontWeight="500">
                          {submitStatus.message}
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>

                {/* Selected Columns Section */}
                {selectedColumns.length > 0 && (
                  <Card 
                    sx={{ 
                      mt: 4,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'primary.light',
                      bgcolor: alpha('#1976d2', 0.02)
                    }}
                  >
                    <CardHeader
                      title={
                        <Box display="flex" alignItems="center">
                          <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                          Selected Columns & Sequence Configuration
                        </Box>
                      }
                      subheader={`${selectedColumns.length} column(s) selected`}
                      titleTypographyProps={{ 
                        variant: 'h6',
                        fontWeight: 600,
                        color: 'primary.dark'
                      }}
                      subheaderTypographyProps={{
                        color: 'text.secondary'
                      }}
                      sx={{ pb: 1 }}
                    />
                    <CardContent>
                      <TableContainer 
                        component={Paper}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Column Name</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Data Type</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Validation Rule</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Sequence Number</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedColumns.map(colId => {
                              const column = allColumns.find(c => c.ColumnId === colId);
                              const validationId = columnValidations[colId];
                              const validation = availableValidations.find(v => v.Id === validationId);
                              return (
                                <TableRow 
                                  key={colId}
                                  sx={{ 
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    '&:hover': { bgcolor: 'action.hover' }
                                  }}
                                >
                                  <TableCell>
                                    <Typography fontWeight="500">
                                      {column?.ColumnName}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={column?.DataType} 
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {validation ? (
                                      <Chip 
                                        label={validation.ValidationList} 
                                        size="small"
                                        color="success"
                                        variant="filled"
                                        onDelete={() => handleClearValidationRule(colId)}
                                        deleteIcon={<CloseIcon />}
                                      />
                                    ) : (
                                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                        No validation
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell sx={{ width: 150 }}>
                                    <TextField
                                      type="number"
                                      value={sequences[colId] || ''}
                                      onChange={(e) => handleSequenceChange(colId, e.target.value)}
                                      required
                                      fullWidth
                                      size="small"
                                      error={!!sequenceErrors[colId]}
                                      helperText={sequenceErrors[colId]}
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          borderRadius: 1
                                        }
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Tooltip title="Remove column" arrow>
                                      <IconButton 
                                        onClick={() => handleRemoveColumn(colId)}
                                        color="error"
                                        size="small"
                                      >
                                        <CloseIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Box sx={{ mt: 3 }}>
                        <Button 
                          type="submit" 
                          variant="contained" 
                          color="primary" 
                          fullWidth 
                          name="addFormInfo" 
                          startIcon={<CheckCircleIcon />}
                          sx={{ 
                            borderRadius: 2,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                            '&:hover': {
                              boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                            }
                          }}
                        >
                          Save Form Configuration
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Columns Section */}
                {existingColumns.length > 0 && (
                  <Card 
                    sx={{ 
                      mt: 4,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}
                  >
                    <CardHeader
                      title={
                        <Box display="flex" alignItems="center">
                          <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
                          Existing Columns in Form
                        </Box>
                      }
                      subheader={`${existingColumns.length} column(s) already configured`}
                      titleTypographyProps={{ 
                        variant: 'h6',
                        fontWeight: 600
                      }}
                      sx={{ pb: 1 }}
                    />
                    <CardContent>
                      <TableContainer 
                        component={Paper}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              <TableCell sx={{ fontWeight: 600 }}>Column ID</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Column Name</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Data Type</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Sequence</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {existingColumns.map((col) => (
                              <TableRow 
                                key={col.ColId}
                                sx={{ 
                                  '&:last-child td, &:last-child th': { border: 0 },
                                  '&:hover': { bgcolor: 'action.hover' }
                                }}
                              >
                                <TableCell>
                                  <Chip 
                                    label={col.ColId} 
                                    size="small"
                                    color="default"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography fontWeight="500">
                                    {col.ColumnName}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={col.DataType} 
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={col.SequenceNo} 
                                    size="small"
                                    color="secondary"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Column Selection Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 12px 48px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          py: 3
        }}>
          <Box display="flex" alignItems="center">
            <AddIcon sx={{ mr: 2 }} />
            <Typography variant="h6" fontWeight="600">
              Select Columns for Form
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List sx={{ py: 1 }}>
            {availableColumns.map((col) => {
              const isExisting = existingColumnIds.includes(col.ColumnId);
              const isSelected = tempSelectedColumns.includes(col.ColumnId);
              return (
                <ListItem 
                  key={col.ColumnId} 
                  button="true" 
                  disabled={isExisting}
                  sx={{
                    py: 2,
                    px: 3,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: isExisting ? 'transparent' : 'action.hover'
                    },
                    '&.Mui-disabled': {
                      opacity: 0.6
                    }
                  }}
                >
                  <Checkbox
                    checked={isExisting || isSelected}
                    disabled={isExisting}
                    onChange={() => handleToggleColumn(col)}
                    color="primary"
                    sx={{ mr: 2 }}
                  />
                  <ListItemText 
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography 
                          variant="body1" 
                          fontWeight={500}
                          color={isExisting ? 'text.secondary' : 'text.primary'}
                        >
                          {col.ColumnName}
                        </Typography>
                        {isExisting && (
                          <Chip 
                            label="Already in form" 
                            size="small" 
                            color="default"
                            sx={{ ml: 2 }}
                          />
                        )}
                      </Box>
                    } 
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        ID: {col.ColumnId} • Type: {col.DataType}
                      </Typography>
                    } 
                  />

                  {!(col.DataType?.toLowerCase() === 'select' ||
                    col.DataType?.toLowerCase() === 'radio' ||
                    col.DataType?.toLowerCase() === 'checkbox') && 
                   !isExisting && 
                   isSelected && (
                    <>
                      {columnValidations[col.ColumnId] ? (
                        <Tooltip title="Clear validation rule" arrow>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearValidationRule(col.ColumnId);
                            }}
                            sx={{ 
                              ml: 2, 
                              textTransform: 'none',
                              borderRadius: 1
                            }}
                            startIcon={<CloseIcon />}
                          >
                            Clear
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Set validation rule" arrow>
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenValidationDialog(col);
                            }}
                            sx={{ 
                              ml: 2, 
                              textTransform: 'none',
                              borderRadius: 1
                            }}
                            startIcon={<RuleIcon />}
                          >
                            Set Required
                          </Button>
                        </Tooltip>
                      )}
                    </>
                  )}
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 4,
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDialog} 
            variant="contained"
            startIcon={<CheckCircleIcon />}
            sx={{ 
              borderRadius: 2,
              px: 4,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Confirm Selection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Options Dialog */}
      {optionsDialogOpen && selectedColForOptions && (
        <ColumnOptionEditorDialog
          open={optionsDialogOpen}
          onClose={handleCloseOptionsDialog}
          onSuccessfulSubmit={handleOptionsSubmitSuccess}
          colId={selectedColForOptions.colId}
          dataType={selectedColForOptions.dataType}
          columnName={selectedColForOptions.columnName}
          formId={formId}
        />
      )}

      {/* Validation Rule Dialog */}
      {validationDialogOpen && selectedColForValidation && (
        <ValidationRuleDialog
          open={validationDialogOpen}
          onClose={handleCloseValidationDialog}
          onSave={handleSaveValidationRule}
          validationOptions={availableValidations}
          initialValue={columnValidations[selectedColForValidation.ColumnId]}
        />
      )}

      {/* Info Dialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 2
        }}>
          <Box display="flex" alignItems="center">
            <InfoIcon sx={{ mr: 1 }} />
            Form Info Options
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={isValidFormFront}
                  onChange={(e) => setIsValidFormFront(e.target.checked)}
                  color="primary"
                />
              }
              label="Show info Before"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isValidFormBack}
                  onChange={(e) => setIsValidFormBack(e.target.checked)}
                  color="primary"
                />
              }
              label="Show info Back"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => {
              setInfoDialogOpen(false);
              setIsValidFormFront(false);
              setIsValidFormBack(false);
            }}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              navigate('/content', { state: { formId, formName, isValidFormFront, isValidFormBack } });
            }}
            variant="contained"
            startIcon={<CheckCircleIcon />}
            sx={{
              borderRadius: 2,
              px: 3
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FormDetails;