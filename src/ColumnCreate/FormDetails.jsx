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
  Zoom,
  useMediaQuery,
  useTheme,
  Avatar,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  Add as AddIcon, 
  Close as CloseIcon, 
  Rule as RuleIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Home as HomeIcon,
  ListAlt as ListAltIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import api from '../axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ColumnOptionEditorDialog from './ColumnOptionEditorDialog';

// Enhanced ValidationRuleDialog with better styling and dark mode support
const ValidationRuleDialog = ({ open, onClose, onSave, validationOptions, initialValue }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [selectedValue, setSelectedValue] = useState(initialValue || '');

  useEffect(() => {
    setSelectedValue(initialValue || '');
  }, [initialValue, open]);

  const handleSave = () => {
    onSave(selectedValue);
  };

  const dialogStyle = {
    borderRadius: 3,
    boxShadow: isDarkMode 
      ? '0 8px 32px rgba(0,0,0,0.4)' 
      : '0 8px 32px rgba(0,0,0,0.12)',
    m: isMobile ? 2 : 3,
    background: isDarkMode 
      ? theme.palette.background.paper 
      : theme.palette.background.paper,
    border: isDarkMode ? `1px solid ${theme.palette.divider}` : 'none'
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{ sx: dialogStyle }}
    >
      <DialogTitle sx={{ 
        py: 3,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '5%',
          width: '90%',
          height: '2px',
          bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }
      }}>
        <Box display="flex" alignItems="center" sx={{ flexDirection: isMobile ? 'column' : 'row', gap: 1 }}>
          <RuleIcon sx={{ mr: 1, fontSize: isMobile ? '1.5rem' : 'inherit' }} />
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight="600" color={isDarkMode ? 'text.primary' : 'text.primary'}>
            Set Validation Rule
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: isMobile ? 2 : 3, pt: 3 }}>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel 
            id="validation-select-label" 
            sx={{ 
              transform: 'translate(14px, 14px) scale(1)',
              '&.Mui-focused': {
                color: 'primary.main'
              },
              color: isDarkMode ? 'text.secondary' : 'text.primary'
            }}
          >
            Select Validation Rule
          </InputLabel>
          <Select
            labelId="validation-select-label"
            value={selectedValue}
            label="Select Validation Rule"
            onChange={(e) => setSelectedValue(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isDarkMode ? theme.palette.divider : 'grey.300',
                borderWidth: '2px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
                borderWidth: '2px'
              },
              borderRadius: 2,
              backgroundColor: isDarkMode ? theme.palette.background.default : 'background.paper'
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: 2,
                  mt: 1,
                  boxShadow: isDarkMode 
                    ? '0 8px 24px rgba(0,0,0,0.4)' 
                    : '0 8px 24px rgba(0,0,0,0.12)',
                  backgroundColor: isDarkMode 
                    ? theme.palette.background.paper 
                    : 'background.paper'
                }
              }
            }}
          >
            <MenuItem value="">
              <em style={{ color: isDarkMode ? theme.palette.text.secondary : 'inherit' }}>No Validation</em>
            </MenuItem>
            {validationOptions.map((option) => (
              <MenuItem key={option.Id} value={option.Id} sx={{ py: 1.5 }}>
                <Box>
                  <Typography variant="body1" fontWeight="500" color={isDarkMode ? 'text.primary' : 'text.primary'}>
                    {option.ValidationList}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: isMobile ? 2 : 3, pt: 0, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          fullWidth={isMobile}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: isMobile ? 1.5 : 1,
            textTransform: 'none',
            fontWeight: '600',
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          startIcon={<CheckCircleIcon />}
          fullWidth={isMobile}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: isMobile ? 1.5 : 1,
            textTransform: 'none',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
            }
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';
  
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

  // Dark mode styles
  const cardStyle = {
    borderRadius: 3,
    boxShadow: isDarkMode 
      ? '0 4px 20px rgba(0,0,0,0.3)' 
      : '0 4px 20px rgba(0,0,0,0.08)',
    overflow: 'visible',
    backgroundColor: isDarkMode 
      ? theme.palette.background.paper 
      : theme.palette.background.paper,
    border: isDarkMode ? `1px solid ${theme.palette.divider}` : 'none'
  };

  const tableContainerStyle = {
    borderRadius: 0,
    border: 'none',
    boxShadow: 'none',
    backgroundColor: isDarkMode 
      ? theme.palette.background.paper 
      : theme.palette.background.paper
  };

  const tableRowHoverStyle = {
    '&:hover': {
      backgroundColor: isDarkMode 
        ? theme.palette.action.hover 
        : 'action.hover',
    },
    transition: 'background-color 0.2s ease'
  };

  const listItemStyle = {
    borderRadius: 2,
    mb: 1,
    py: 2,
    border: isDarkMode 
      ? `1px solid ${theme.palette.divider}` 
      : '1px solid rgba(0,0,0,0.1)',
    '&:hover': {
      backgroundColor: isDarkMode 
        ? theme.palette.action.hover 
        : 'rgba(33, 150, 243, 0.08)',
      transform: 'translateX(4px)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    transition: 'all 0.2s ease',
    backgroundColor: isDarkMode 
      ? theme.palette.background.paper 
      : theme.palette.background.paper
  };

  const dialogStyle = {
    borderRadius: 3,
    boxShadow: isDarkMode 
      ? '0 12px 48px rgba(0,0,0,0.4)' 
      : '0 12px 48px rgba(0,0,0,0.15)',
    m: isMobile ? 1 : 3,
    height: isMobile ? '90vh' : 'auto',
    backgroundColor: isDarkMode 
      ? theme.palette.background.paper 
      : theme.palette.background.paper,
    border: isDarkMode ? `1px solid ${theme.palette.divider}` : 'none'
  };

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
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="70vh"
        sx={{
          backgroundColor: isDarkMode ? theme.palette.background.default : 'background.default'
        }}
      >
        <Box textAlign="center">
          <CircularProgress 
            size={isMobile ? 50 : 60} 
            thickness={4} 
            sx={{ 
              color: 'primary.main',
              mb: 2
            }} 
          />
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            color="text.secondary"
            fontWeight="500"
          >
            Loading Form Details...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        mt: isMobile ? 2 : 4, 
        mb: isMobile ? 4 : 6,
        px: isMobile ? 2 : 3,
        backgroundColor: isDarkMode ? theme.palette.background.default : 'background.default',
        minHeight: '100vh'
      }}
    >
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: isMobile ? 3 : 4 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{
            '& .MuiBreadcrumbs-ol': {
              flexWrap: isSmallMobile ? 'wrap' : 'nowrap'
            }
          }}
        >
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: isSmallMobile ? '0.875rem' : '1rem',
              color: isDarkMode ? 'text.primary' : 'inherit'
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: isSmallMobile ? '1rem' : '1.25rem' }} />
            Home
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/forms');
            }}
            sx={{ 
              fontSize: isSmallMobile ? '0.875rem' : '1rem',
              color: isDarkMode ? 'text.primary' : 'inherit'
            }}
          >
            Forms
          </Link>
          <Typography 
            color="text.primary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: isSmallMobile ? '0.875rem' : '1rem'
            }}
          >
            <ListAltIcon sx={{ mr: 0.5, fontSize: isSmallMobile ? '1rem' : '1.25rem' }} />
            {formName || 'Form Configuration'}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Banner Card */}
        <Grid item xs={12} lg={4}>
          <Card 
            sx={{ 
              ...cardStyle,
              height: 'fit-content',
              position: 'sticky',
              top: isMobile ? 0 : 20
            }}
          >
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  <ImageIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="600" color={isDarkMode ? 'text.primary' : 'text.primary'}>
                    Banner Image
                  </Typography>
                </Box>
              }
              titleTypographyProps={{ 
                variant: 'h6',
                fontWeight: 600 
              }}
              sx={{ 
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5} alignItems="center">
                {bannerImagePreviewUrl ? (
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: isMobile ? 160 : 200, 
                      border: '2px dashed',
                      borderColor: 'primary.light',
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      overflow: 'hidden',
                      bgcolor: isDarkMode ? 'grey.900' : 'grey.50',
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
                      height: isMobile ? 160 : 200, 
                      border: '2px dashed',
                      borderColor: isDarkMode ? 'grey.600' : 'grey.400',
                      borderRadius: 2, 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      backgroundColor: isDarkMode ? 'grey.900' : 'grey.50',
                      color: isDarkMode ? 'grey.400' : 'grey.500',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: isDarkMode ? 'grey.800' : 'grey.100'
                      }
                    }}
                  >
                    <ImageIcon sx={{ fontSize: isMobile ? 40 : 48, mb: 1.5, opacity: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No Banner Image
                    </Typography>
                    <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 0.5 }}>
                      Upload a banner image for your form
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
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: isMobile ? '0.875rem' : '1rem'
                    }}
                  >
                    {bannerImagePreviewUrl ? 'Change Banner' : 'Upload Banner'}
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
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 1
                    }}
                  >
                    Remove Image
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Form Card */}
        <Grid item xs={12} lg={8}>
          <Card sx={cardStyle}>
            <CardContent sx={{ p: isMobile ? 2 : 4 }}>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                {/* Header Section */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between', 
                    alignItems: isMobile ? 'flex-start' : 'center', 
                    mb: 4,
                    pb: 3,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    gap: isMobile ? 2 : 0
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography 
                      variant={isMobile ? "h5" : "h4"} 
                      component="h1" 
                      fontWeight="700"
                      color="primary.main"
                      gutterBottom
                    >
                      Form Configuration
                    </Typography>
                    <Typography 
                      variant={isMobile ? "body2" : "body1"} 
                      color="text.secondary"
                      sx={{ mb: isMobile ? 2 : 0 }}
                    >
                      Add and configure columns for your form
                    </Typography>
                  </Box>
                  <Tooltip title="Add form information" arrow placement={isMobile ? "bottom" : "left"}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => setInfoDialogOpen(true)}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        width: isMobile ? '100%' : 'auto',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Add Form Info
                    </Button>
                  </Tooltip>
                </Box>
               
                <Grid container spacing={isMobile ? 2 : 3}>
                  {/* Form Name and Select Columns */}
                  <Grid item xs={12}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        borderRadius: 2,
                        borderColor: isDarkMode ? theme.palette.divider : 'grey.200',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        },
                        backgroundColor: isDarkMode ? theme.palette.background.paper : 'background.paper'
                      }}
                    >
                      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                        <Stack 
                          direction={{ xs: 'column', sm: 'row' }} 
                          spacing={2} 
                          alignItems={{ xs: 'stretch', sm: 'center' }} 
                          sx={{ width: '100%' }}
                        >
                          <Box sx={{ flexGrow: 1 }}>
                            <TextField 
                              label="Form Name" 
                              value={formName} 
                              InputProps={{ 
                                readOnly: true,
                                sx: { 
                                  borderRadius: 2,
                                  '& .MuiOutlinedInput-input': {
                                    py: isMobile ? 1.5 : 2,
                                    fontSize: isMobile ? '0.875rem' : '1rem'
                                  },
                                  backgroundColor: isDarkMode ? theme.palette.background.default : 'background.paper'
                                }
                              }} 
                              variant="outlined"
                              fullWidth
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main',
                                    borderWidth: '2px'
                                  },
                                },
                                '& .MuiInputLabel-root': {
                                  fontSize: isMobile ? '0.875rem' : '1rem'
                                }
                              }}
                            />
                          </Box>
                          <Tooltip title="Select columns to add to your form" arrow>
                            <Button
                              variant="contained"
                              color="secondary"
                              startIcon={<AddIcon />}
                              onClick={handleOpenDialog}
                              fullWidth={isMobile}
                              sx={{ 
                                whiteSpace: 'nowrap',
                                borderRadius: 2,
                                px: 4,
                                py: isMobile ? 1.5 : 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                minWidth: isMobile ? 'auto' : 200,
                                width: { xs: '100%', sm: 'auto' },
                                fontSize: isMobile ? '0.875rem' : '1rem',
                                boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                                '&:hover': {
                                  boxShadow: '0 6px 16px rgba(156, 39, 176, 0.4)'
                                }
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
                          py: isMobile ? 1 : 2,
                          '& .MuiAlert-message': {
                            width: '100%',
                            py: 0.5
                          }
                        }}
                        iconMapping={{
                          success: <CheckCircleIcon fontSize="large" />,
                          warning: <WarningIcon fontSize="large" />,
                          error: <WarningIcon fontSize="large" />,
                          info: <InfoIcon fontSize="large" />
                        }}
                      >
                        <Typography 
                          fontWeight="500" 
                          fontSize={isMobile ? '0.875rem' : '1rem'}
                        >
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
                      border: '2px solid',
                      borderColor: 'primary.light',
                      overflow: 'hidden',
                      backgroundColor: isDarkMode ? theme.palette.background.paper : 'background.paper'
                    }}
                  >
                    <CardHeader
                      title={
                        <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                          <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                          <Typography variant="h6" fontWeight="600" color="primary.dark">
                            Selected Columns & Sequence
                          </Typography>
                          <Chip 
                            label={`${selectedColumns.length} column(s)`} 
                            size="small" 
                            color="primary"
                            variant="filled"
                            sx={{ ml: 'auto' }}
                          />
                        </Box>
                      }
                      sx={{ 
                        pb: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                    <CardContent sx={{ p: 0 }}>
                      <TableContainer 
                        component={Paper}
                        variant="outlined"
                        sx={tableContainerStyle}
                      >
                        <Table sx={{ minWidth: isMobile ? 600 : 'auto' }}>
                          <TableHead>
                            <TableRow sx={{ 
                              backgroundColor: isDarkMode ? theme.palette.background.default : 'grey.50' 
                            }}>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 2 }}>Column Name</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 2 }}>Data Type</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 2 }}>Validation Rule</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 2, width: 150 }}>Sequence</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 2, width: 100 }}>Actions</TableCell>
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
                                  sx={tableRowHoverStyle}
                                >
                                  <TableCell sx={{ py: 2 }}>
                                    <Typography fontWeight="500" fontSize={isMobile ? '0.875rem' : '1rem'}>
                                      {column?.ColumnName}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ py: 2 }}>
                                    <Chip 
                                      label={column?.DataType} 
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      sx={{ 
                                        fontWeight: '500',
                                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ py: 2 }}>
                                    {validation ? (
                                      <Chip 
                                        label={validation.ValidationList} 
                                        size="small"
                                        color="success"
                                        variant="filled"
                                        onDelete={() => handleClearValidationRule(colId)}
                                        deleteIcon={<CloseIcon />}
                                        sx={{ 
                                          fontWeight: '500',
                                          fontSize: isMobile ? '0.75rem' : '0.875rem',
                                          maxWidth: isMobile ? 150 : 200
                                        }}
                                      />
                                    ) : (
                                      <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                                        fontStyle="italic"
                                        fontSize={isMobile ? '0.75rem' : '0.875rem'}
                                      >
                                        No validation
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell sx={{ py: 2, width: 150 }}>
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
                                          borderRadius: 1,
                                          fontSize: isMobile ? '0.875rem' : '1rem',
                                          backgroundColor: isDarkMode ? theme.palette.background.default : 'background.paper'
                                        },
                                        '& .MuiFormHelperText-root': {
                                          fontSize: isMobile ? '0.7rem' : '0.75rem',
                                          mx: 0
                                        }
                                      }}
                                      InputProps={{
                                        sx: {
                                          py: isMobile ? 0.75 : 1
                                        }
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ py: 2, width: 100 }}>
                                    <Tooltip title="Remove column" arrow>
                                      <IconButton 
                                        onClick={() => handleRemoveColumn(colId)}
                                        color="error"
                                        size={isMobile ? "small" : "medium"}
                                        sx={{
                                          '&:hover': {
                                            backgroundColor: 'error.light',
                                            color: 'white'
                                          }
                                        }}
                                      >
                                        <CloseIcon fontSize={isMobile ? "small" : "medium"} />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Box sx={{ p: 3, pt: 2 }}>
                        <Button 
                          type="submit" 
                          variant="contained" 
                          color="primary" 
                          fullWidth 
                          name="addFormInfo" 
                          startIcon={<CheckCircleIcon />}
                          sx={{ 
                            borderRadius: 2,
                            py: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: isMobile ? '1rem' : '1.1rem',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                            '&:hover': {
                              boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.3s ease'
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
                      borderColor: isDarkMode ? theme.palette.divider : 'grey.200',
                      overflow: 'hidden',
                      backgroundColor: isDarkMode ? theme.palette.background.paper : 'background.paper'
                    }}
                  >
                    <CardHeader
                      title={
                        <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                          <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
                          <Typography variant="h6" fontWeight="600" color={isDarkMode ? 'text.primary' : 'text.primary'}>
                            Existing Columns in Form
                          </Typography>
                          <Chip 
                            label={`${existingColumns.length} column(s)`} 
                            size="small" 
                            color="info"
                            variant="filled"
                            sx={{ ml: 'auto' }}
                          />
                        </Box>
                      }
                      sx={{ 
                        pb: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                    <CardContent sx={{ p: 0 }}>
                      <TableContainer 
                        component={Paper}
                        variant="outlined"
                        sx={tableContainerStyle}
                      >
                        <Table sx={{ minWidth: isMobile ? 600 : 'auto' }}>
                          <TableHead>
                            <TableRow sx={{ 
                              backgroundColor: isDarkMode ? theme.palette.background.default : 'grey.50' 
                            }}>
                              <TableCell sx={{ fontWeight: 600, py: 2 }}>Column ID</TableCell>
                              <TableCell sx={{ fontWeight: 600, py: 2 }}>Column Name</TableCell>
                              <TableCell sx={{ fontWeight: 600, py: 2 }}>Data Type</TableCell>
                              <TableCell sx={{ fontWeight: 600, py: 2 }}>Sequence</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {existingColumns.map((col) => (
                              <TableRow 
                                key={col.ColId}
                                sx={tableRowHoverStyle}
                              >
                                <TableCell sx={{ py: 2 }}>
                                  <Chip 
                                    label={col.ColId} 
                                    size="small"
                                    color="default"
                                    variant="outlined"
                                    sx={{ 
                                      fontWeight: '500',
                                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ py: 2 }}>
                                  <Typography 
                                    fontWeight="500" 
                                    fontSize={isMobile ? '0.875rem' : '1rem'}
                                  >
                                    {col.ColumnName}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ py: 2 }}>
                                  <Chip 
                                    label={col.DataType} 
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ 
                                      fontWeight: '500',
                                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ py: 2 }}>
                                  <Chip 
                                    label={col.SequenceNo} 
                                    size="small"
                                    color="secondary"
                                    sx={{ 
                                      fontWeight: '500',
                                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                                    }}
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
        PaperProps={{ sx: dialogStyle }}
      >
        <DialogTitle sx={{ 
          py: 3,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: isDarkMode ? theme.palette.background.paper : 'background.paper',
          borderBottom: isDarkMode ? `1px solid ${theme.palette.divider}` : '1px solid rgba(0,0,0,0.1)'
        }}>
          <Box display="flex" alignItems="center" flexDirection={isMobile ? 'column' : 'row'} gap={1}>
            <AddIcon sx={{ mr: isMobile ? 0 : 2, fontSize: isMobile ? '1.5rem' : 'inherit' }} />
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="600" textAlign={isMobile ? 'center' : 'left'} color={isDarkMode ? 'text.primary' : 'text.primary'}>
              Select Columns for Form
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, maxHeight: isMobile ? 'calc(90vh - 140px)' : '60vh' }}>
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
                    ...listItemStyle,
                    '&:hover': {
                      bgcolor: isExisting ? 'transparent' : (isDarkMode ? theme.palette.action.hover : 'action.hover')
                    },
                    '&.Mui-disabled': {
                      opacity: 0.6
                    },
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
                      <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                        <Typography 
                          variant="body1" 
                          fontWeight={500}
                          color={isExisting ? 'text.secondary' : 'text.primary'}
                          fontSize={isMobile ? '0.875rem' : '1rem'}
                        >
                          {col.ColumnName}
                        </Typography>
                        {isExisting && (
                          <Chip 
                            label="Already in form" 
                            size="small" 
                            color="default"
                            sx={{ 
                              fontSize: isMobile ? '0.7rem' : '0.75rem',
                              height: isMobile ? 20 : 24
                            }}
                          />
                        )}
                      </Box>
                    } 
                    secondary={
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        fontSize={isMobile ? '0.75rem' : '0.875rem'}
                        sx={{ mt: 0.5 }}
                      >
                        ID: {col.ColumnId} • Type: {col.DataType}
                      </Typography>
                    } 
                  />

                  {!(col.DataType?.toLowerCase() === 'select' ||
                    col.DataType?.toLowerCase() === 'radio' ||
                    col.DataType?.toLowerCase() === 'checkbox') && 
                   !isExisting && 
                   isSelected && (
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
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
                              textTransform: 'none',
                              borderRadius: 1,
                              fontSize: isMobile ? '0.7rem' : '0.875rem',
                              px: isMobile ? 1 : 2,
                              minWidth: 'auto'
                            }}
                            startIcon={<CloseIcon fontSize={isMobile ? "small" : "medium"} />}
                          >
                            {isMobile ? '' : 'Clear'}
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
                              textTransform: 'none',
                              borderRadius: 1,
                              fontSize: isMobile ? '0.7rem' : '0.875rem',
                              px: isMobile ? 1 : 2,
                              minWidth: 'auto'
                            }}
                            startIcon={<RuleIcon fontSize={isMobile ? "small" : "medium"} />}
                          >
                            {isMobile ? '' : 'Set Required'}
                          </Button>
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions sx={{ 
          p: isMobile ? 2 : 3, 
          gap: 1,
          backgroundColor: isDarkMode ? theme.palette.background.paper : 'background.paper',
          borderTop: isDarkMode ? `1px solid ${theme.palette.divider}` : '1px solid rgba(0,0,0,0.1)'
        }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            fullWidth={isMobile}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: isMobile ? 1.5 : 1,
              textTransform: 'none',
              fontWeight: '600',
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDialog} 
            variant="contained"
            startIcon={<CheckCircleIcon />}
            fullWidth={isMobile}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: isMobile ? 1.5 : 1,
              textTransform: 'none',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
              }
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
            borderRadius: 3,
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0,0,0,0.4)' 
              : '0 8px 32px rgba(0,0,0,0.12)',
            m: isMobile ? 2 : 3,
            backgroundColor: isDarkMode 
              ? theme.palette.background.paper 
              : theme.palette.background.paper,
            border: isDarkMode ? `1px solid ${theme.palette.divider}` : 'none'
          }
        }}
      >
        <DialogTitle sx={{
          py: 3,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '5%',
            width: '90%',
            height: '2px',
            bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          }
        }}>
          <Box display="flex" alignItems="center" sx={{ flexDirection: isMobile ? 'column' : 'row', gap: 1 }}>
            <InfoIcon sx={{ mr: 1, fontSize: isMobile ? '1.5rem' : 'inherit' }} />
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="600" color={isDarkMode ? 'text.primary' : 'text.primary'}>
              Form Info Options
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3, pt: 3 }}>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={isValidFormFront}
                  onChange={(e) => setIsValidFormFront(e.target.checked)}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                />
              }
              label={
                <Typography variant={isMobile ? "body2" : "body1"} fontWeight="500" color={isDarkMode ? 'text.primary' : 'text.primary'}>
                  Show info Before Form
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isValidFormBack}
                  onChange={(e) => setIsValidFormBack(e.target.checked)}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                />
              }
              label={
                <Typography variant={isMobile ? "body2" : "body1"} fontWeight="500" color={isDarkMode ? 'text.primary' : 'text.primary'}>
                  Show info After Form
                </Typography>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3, pt: 0, gap: 1 }}>
          <Button
            onClick={() => {
              setInfoDialogOpen(false);
              setIsValidFormFront(false);
              setIsValidFormBack(false);
            }}
            variant="outlined"
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              px: 3,
              py: isMobile ? 1.5 : 1,
              textTransform: 'none',
              fontWeight: '600',
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px'
              }
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
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              px: 3,
              py: isMobile ? 1.5 : 1,
              textTransform: 'none',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
              }
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