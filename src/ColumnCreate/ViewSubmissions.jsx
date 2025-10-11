import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// Helper to read query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}
import { toast } from 'react-toastify';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  Grid,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  AppBar,
  Toolbar,
  useTheme,
  RadioGroup,
  Radio,
  FormLabel,
  TablePagination,
  useMediaQuery,
  Divider,
  FormHelperText,
  alpha,
  Avatar,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh,
  Visibility,
  Download,
  Edit,
  Logout as LogoutIcon,
  PictureAsPdf,
  InsertDriveFile
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import api from "../axiosConfig";
import { sendWhatsAppMessage } from '../whatsappService';
import { validateField } from "../utils/validationUtils";

// Helper to construct base URL for assets
const getBaseUrl = () => {
  const baseUrl = api.defaults.baseURL;
  if (baseUrl.startsWith('/')) {
    return `${window.location.origin}`;
  }
  return baseUrl.replace('/api', '');
};

const ViewSubmissions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();
  const theme = useTheme();
  const { formId: formIdFromParams } = useParams();

  // Check if mobile view
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Prioritize state, then fallback to query params
  const formIdFromState = location.state?.formId;
  const formNoFromState = location.state?.formNo;

  const formIdFromQuery = query.get("formId");
  const formNoFromQuery = query.get("formNo");

  const formId = formIdFromParams || formIdFromState || formIdFromQuery;
  const formNo = formNoFromState || formNoFromQuery;

  const [submissions, setSubmissions] = useState([]);
  const [columns, setColumns] = useState([]);
  const [formName, setFormName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, lastUpdated: null });

  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState('');

  // View Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Edit Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSubmission, setEditSubmission] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editColumnOptions, setEditColumnOptions] = useState({});
  const [editValidationErrors, setEditValidationErrors] = useState({});

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const userId = sessionStorage.getItem('userId');
  const isFormOnlyUser = sessionStorage.getItem('isFormOnlyUser') === 'true';

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = `/${formId}`;
  };

  const fetchData = async () => {
    const parsedFormId = parseInt(formId);
    const parsedFormNo = parseInt(formNo);

    if (isNaN(parsedFormId) || isNaN(parsedFormNo)) {
      setError('Invalid Form ID or Form No. Please ensure they are valid numbers.');
      setLoading(false);
      return;
    }

    if (!userId) {
      setError("User identifier not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const endpoint = isFormOnlyUser
        ? `/formvalues/values?formId=${parsedFormId}&formNo=${parsedFormNo}`
        : `/formvalues/values/all?formId=${parsedFormId}&formNo=${parsedFormNo}`;

      const valuesResponse = await api.get(endpoint);

      if (valuesResponse.data && valuesResponse.data.length > 0) {
        let { submissions: groupedSubmissions, columns: dynamicColumns, formName: name } = valuesResponse.data[0];
        
        const validationRulesResponse = await api.get(`/validation/${parsedFormId}`);
        const formValidationRulesMap = new Map();
        validationRulesResponse.data.forEach(rule => {
          formValidationRulesMap.set(rule.ColId, rule.ValidationList);
        });

        dynamicColumns = dynamicColumns.map(col => ({
          ...col,
          Validation: formValidationRulesMap.get(col.ColId) || null,
        }));

        const uniqueColumns = Array.from(new Map(dynamicColumns.map(item => [item.ColId, item])).values());
        setSubmissions(groupedSubmissions);
        setColumns(uniqueColumns);
        setFormName(name);
        setStats({
          total: groupedSubmissions.length,
          lastUpdated: new Date().toLocaleTimeString()
        });
      } else {
        setSubmissions([]);
        setColumns([]);
        setStats({ total: 0, lastUpdated: new Date().toLocaleTimeString() });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch submission data.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formId, formNo, userId, isFormOnlyUser]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // View
  const handleViewClick = (submission) => {
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedSubmission(null);
  };

  const handleViewPhotoClick = (imagePath) => {
    const imageUrl = imagePath.startsWith('http://') || imagePath.startsWith('https://')
      ? imagePath
      : `${getBaseUrl()}${imagePath}`;
    setSelectedPhotoUrl(imageUrl);
    setPhotoDialogOpen(true);
  };

  const handlePhotoDialogClose = () => {
    setPhotoDialogOpen(false);
    setSelectedPhotoUrl('');
  };

  // Edit
  const handleEditClick = async (submission) => {
    setEditSubmission({ ...submission });

    try {
      const optionsPromises = columns.map(async (col) => {
        const dataType = col.DataType?.toLowerCase();
        if (dataType === 'select' || dataType === 'radio' || dataType === 'checkbox') {
          const endpoint =
            dataType === 'select' ? `/dropdown-dtl/${col.ColId}?formId=${formId}` :
            dataType === 'radio' ? `/radiobox-dtl/${col.ColId}?formId=${formId}` :
            `/checkbox-dtl/${col.ColId}?formId=${formId}`;
          
          const res = await api.get(endpoint);

          const options =
            dataType === 'select' ? res.data.map(item => item.DropdownName) :
            dataType === 'radio' ? res.data.map(item => item.RadioBoxName) :
            res.data.map(item => item.CheckBoxName);

          return { colId: col.ColId, options };
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
      setEditColumnOptions(newColumnOptions);
      setEditDialogOpen(true);
    } catch (err) {
      console.error("Error fetching options for edit dialog:", err);
      toast.error("Failed to load options for editing.");
    }
  };

  const handleEditChange = (colId, value) => {
    setEditSubmission((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [colId]: value
      }
    }));
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    handleEditSave();
  };

  const handleEditSave = async () => {
    if (!editSubmission) return;

    let errors = {};
    let hasError = false;

    for (const col of columns) {
      const value = editSubmission.values[col.ColId];
      const error = validateField(col, value);
      if (error) {
        errors[col.ColId] = error;
        hasError = true;
      }
    }

    setEditValidationErrors(errors);

    if (hasError) {
      toast.error("Please fill out all required fields correctly.");
      return;
    }

    setSaving(true);
    try {
      const submissionId = editSubmission.SubmissionId.toString().replace(':', '/');
      const formData = new FormData();
      formData.append('formId', parseInt(formId));

      for (const colId in editSubmission.values) {
        if (Object.hasOwnProperty.call(editSubmission.values, colId)) {
          const value = editSubmission.values[colId];
          if (value instanceof File) {
            formData.append(colId, value);
          } else if (Array.isArray(value)) {
            value.forEach(item => formData.append(colId, item));
          } else if (typeof value === 'boolean') {
            formData.append(colId, value ? '1' : '0');
          } else {
            formData.append(colId, value);
          }
        }
      }

      await api.put(
        `/formvalues/values/${submissionId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Submission updated successfully!');

      if (editSubmission.Emailormobileno && formName) {
        const message = `Your form "${formName}" has been updated successfully.`;
        try {
          await sendWhatsAppMessage(editSubmission.Emailormobileno, message);
          toast.success("WhatsApp notification sent.");
        } catch (whatsappError) {
          console.error("WhatsApp Error:", whatsappError);
          toast.error("Failed to send WhatsApp notification.");
        }
      }

      setEditDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error updating submission:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update submission';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderEditInput = (col) => {
    const { ColId, ColumnName, DataType } = col;
    const value = editSubmission?.values[ColId] || '';
    const options = editColumnOptions[ColId] || [];
    const isError = !!editValidationErrors[ColId];
    const errorMessage = editValidationErrors[ColId];

    switch (DataType?.toLowerCase()) {
      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={ColumnName}
            value={value}
            onChange={(e) => handleEditChange(ColId, e.target.value)}
            sx={{ mb: 2 }}
            required={col.IsValid}
            error={isError}
            helperText={errorMessage}
            InputProps={{
              readOnly: col.IsReadOnly,
            }}
            size={isMobile ? "small" : "medium"}
          />
        );
      
      case 'boolean':
      case 'checkbox':
        return (
          <FormControl component="fieldset" fullWidth sx={{ mb: 2 }} error={isError}>
            <FormLabel component="legend" required={col.IsValid} sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
              {ColumnName}
            </FormLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {options.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={editSubmission?.values[ColId]?.includes(option) || false}
                      onChange={(e) => {
                        const currentValues = editSubmission?.values[ColId] || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option]
                          : currentValues.filter((val) => val !== option);
                        handleEditChange(ColId, newValues);
                      }}
                      disabled={col.IsReadOnly}
                      size={isMobile ? "small" : "medium"}
                    />
                  }
                  label={<Typography variant={isMobile ? "body2" : "body1"}>{option}</Typography>}
                />
              ))}
            </Box>
            {isError && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        );
      
      case 'select':
        return (
          <FormControl fullWidth sx={{ mb: 2 }} error={isError} size={isMobile ? "small" : "medium"}>
            <InputLabel required={col.IsValid}>{ColumnName}</InputLabel>
            <Select
              value={value}
              label={ColumnName}
              onChange={(e) => handleEditChange(ColId, e.target.value)}
              required={col.IsValid}
              disabled={col.IsReadOnly}
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
      
      case 'radio':
        return (
          <FormControl component="fieldset" fullWidth sx={{ mb: 2 }} error={isError}>
            <FormLabel component="legend" required={col.IsValid} sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
              {ColumnName}
            </FormLabel>
            <RadioGroup
              aria-label={ColumnName}
              name={ColId}
              value={value}
              onChange={(e) => handleEditChange(ColId, e.target.value)}
              disabled={col.IsReadOnly}
            >
              {options.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio size={isMobile ? "small" : "medium"} />}
                  label={<Typography variant={isMobile ? "body2" : "body1"}>{option}</Typography>}
                />
              ))}
            </RadioGroup>
            {isError && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        );
      
      case 'date':
        return (
          <TextField
            fullWidth
            type="date"
            label={ColumnName}
            value={value}
            onChange={(e) => handleEditChange(ColId, e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
            required={col.IsValid}
            error={isError}
            helperText={errorMessage}
            InputProps={{
              readOnly: col.IsReadOnly,
            }}
            size={isMobile ? "small" : "medium"}
          />
        );
      
      case 'datetime':
        return (
          <TextField
            fullWidth
            type="datetime-local"
            label={ColumnName}
            value={value}
            onChange={(e) => handleEditChange(ColId, e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
            required={col.IsValid}
            error={isError}
            helperText={errorMessage}
            InputProps={{
              readOnly: col.IsReadOnly,
            }}
            size={isMobile ? "small" : "medium"}
          />
        );
      
      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 3 : 4}
            label={ColumnName}
            value={value}
            onChange={(e) => handleEditChange(ColId, e.target.value)}
            sx={{ mb: 2 }}
            required={col.IsValid}
            error={isError}
            helperText={errorMessage || (col.Validation === 'Text Field: Max 5000 Characters (approx. 2 pages)' ? 'Max 5000 Characters (approx. 2 pages)' : '')}
            InputProps={{
              readOnly: col.IsReadOnly,
            }}
            size={isMobile ? "small" : "medium"}
          />
        );
      case 'file':
        return (
          <>
            <Typography variant={isMobile ? "body2" : "body1"} gutterBottom>
              {ColumnName}
            </Typography>
            <TextField
              fullWidth
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                handleEditChange(ColId, file);
              }}
              sx={{ mb: 2 }}
              required={col.IsValid}
              error={isError}
              helperText={errorMessage || 'Only 1 or 2 page PDFs allowed'}
              InputProps={{
                readOnly: col.IsReadOnly,
              }}
              size={isMobile ? "small" : "medium"}
            />
            {value && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <InsertDriveFile color="primary" />
                <Typography variant="caption">Current file: {value}</Typography>
              </Box>
            )}
          </>
        );
      case 'photo':
        const photoSrc = value && (value.startsWith('http://') || value.startsWith('https://')) ? value : `${getBaseUrl()}${value}`;
        return (
          <>
            <Typography variant={isMobile ? "body2" : "body1"} gutterBottom>
              {ColumnName}
            </Typography>
            <TextField
              fullWidth
              type="file"
              inputProps={{ accept: 'image/*' }}
              onChange={(e) => {
                const file = e.target.files[0];
                const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024;
                if (file && file.size > MAX_PHOTO_SIZE_BYTES) {
                  toast.error(`Photo "${file.name}" exceeds the 2MB limit.`);
                  e.target.value = null;
                  handleEditChange(ColId, null);
                } else {
                  handleEditChange(ColId, file);
                }
              }}
              sx={{ mb: 2 }}
              required={col.IsValid}
              error={isError}
              helperText={errorMessage || 'Max 2MB'}
              InputProps={{
                readOnly: col.IsReadOnly,
              }}
              size={isMobile ? "small" : "medium"}
            />
            {value && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <Avatar 
                  src={photoSrc} 
                  variant="rounded"
                  sx={{ width: 60, height: 60, border: `2px solid ${theme.palette.divider}` }}
                />
                <Typography variant="caption" color="text.secondary">
                  Current photo
                </Typography>
              </Box>
            )}
          </>
        );
      default:
        return (
          <TextField
            fullWidth
            label={ColumnName}
            value={value}
            onChange={(e) => handleEditChange(ColId, e.target.value)}
            sx={{ mb: 2 }}
            required={col.IsValid}
            error={isError}
            helperText={errorMessage || (col.Validation === 'Text Field: Max 5000 Characters (approx. 2 pages)' ? 'Max 5000 Characters (approx. 2 pages)' : '')}
            InputProps={{
              readOnly: col.IsReadOnly,
            }}
            size={isMobile ? "small" : "medium"}
          />
        );
    }
  };

  // Export
  const handleExportData = () => {
    if (submissions.length === 0) return; 
    
    const headers = ['Submission ID', ...columns.map(col => col.ColumnName)].join(',');
    const csvContent = submissions.map(sub => {
      const row = [sub.SubmissionId];
      columns.forEach(col => {
        row.push(`"${sub.values[col.ColId] || ''}"`);
      });
      return row.join(',');
    }).join('\n');
    
    const blob = new Blob([headers + '\n' + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formName.replace(/\s+/g, '_')}_submissions.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  const renderCellContent = (col, submission, truncate = true) => {
    const value = submission.values[col.ColId];
    if (!value) {
      return (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          fontStyle="italic"
          sx={truncate ? { 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          } : { fontSize: isMobile ? '0.75rem' : '0.875rem' }}
        >
          Not provided
        </Typography>
      );
    }

    if (col.DataType.toLowerCase() === 'photo') {
      return (
        <Tooltip title="View Photo">
          <IconButton 
            onClick={() => handleViewPhotoClick(value)} 
            size="small" 
            color="primary"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <Visibility fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Tooltip>
      );
    } else if (col.DataType.toLowerCase() === 'file') {
      const fileHref = value.startsWith('http://') || value.startsWith('https://')
        ? value
        : `${getBaseUrl()}${value}`;
      return (
        <Tooltip title="Download file">
          <Button
            component="a"
            href={fileHref}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<PictureAsPdf />}
            size="small"
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontSize: isMobile ? '0.7rem' : '0.875rem',
              px: 1,
              py: 0.5,
              minWidth: 'auto'
            }}
          >
            {isMobile ? 'File' : 'View File'}
          </Button>
        </Tooltip>
      );
    }

    // Truncate long text for table view
    const displayValue = truncate && value.length > 50 ? `${value.substring(0, 50)}...` : value;

    return (
      <Tooltip title={truncate && value.length > 50 ? value : ''} arrow>
        <Typography 
          variant="body2" 
          sx={truncate ? { 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          } : { 
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          }}
        >
          {displayValue}
        </Typography>
      </Tooltip>
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        background: isFormOnlyUser ? 'transparent' : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={isMobile ? 40 : 60} 
            thickness={4}
            sx={{ color: theme.palette.primary.main }}
          />
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            sx={{ 
              mt: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontWeight: 600
            }}
          >
            Loading Submissions...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      {isFormOnlyUser && (
        <AppBar 
          position="sticky" 
          color="primary" 
          elevation={2}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                color: theme.palette.primary.contrastText,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                fontWeight: 600
              }}
            >
              {formName || 'Form Submissions'}
            </Typography>
            <Tooltip title="Logout">
              <IconButton 
                color="inherit" 
                onClick={handleLogout}
                size={isMobile ? "small" : "medium"}
              >
                <LogoutIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
      )}
      
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: isFormOnlyUser ? { xs: 1, sm: 2 } : { xs: 2, sm: 4 },
          px: { xs: 1, sm: 2, md: 3 }
        }}
      >
        <Card 
          elevation={isFormOnlyUser ? 0 : 3} 
          sx={{ 
            borderRadius: isFormOnlyUser ? 0 : { xs: 1, sm: 2 },
            bgcolor: 'background.paper',
            overflow: 'visible',
            border: isFormOnlyUser ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: isFormOnlyUser ? 'none' : `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Header Section - Only show for non-form-only users */}
            {!isFormOnlyUser && (
              <Box sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'primary.contrastText',
                p: { xs: 2, sm: 3 },
                borderTopLeftRadius: { xs: 1, sm: 2 },
                borderTopRightRadius: { xs: 1, sm: 2 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100%',
                  height: '100%',
                  background: `radial-gradient(circle at 30% 20%, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 50%)`
                }
              }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <IconButton
                      onClick={() => navigate(-1)}
                      sx={{ 
                        color: theme.palette.primary.contrastText,
                        backgroundColor: alpha(theme.palette.common.white, 0.2),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.common.white, 0.3),
                        }
                      }}
                      size={isMobile ? "small" : "medium"}
                    >
                      <ArrowBackIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                  </Grid>
                  <Grid item xs>
                    <Typography 
                      variant={isMobile ? "h5" : "h4"} 
                      fontWeight="bold"
                      sx={{
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      {formName || 'Unknown Form'}
                    </Typography>
                    <Typography 
                      variant={isMobile ? "body2" : "body1"} 
                      sx={{ 
                        mt: 1, 
                        opacity: 0.9,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    >
                      View all submitted data for this form
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      label={`${stats.total} submissions`}
                      variant="outlined"
                      sx={{ 
                        color: theme.palette.primary.contrastText, 
                        borderColor: alpha(theme.palette.common.white, 0.5),
                        backgroundColor: alpha(theme.palette.common.white, 0.2),
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        height: { xs: 32, sm: 40 }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Action Bar */}
            <Box sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              backgroundColor: 'background.default', 
              borderBottom: 1, 
              borderColor: 'divider',
              background: `linear-gradient(to right, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`
            }}>
              <Stack 
                direction={isMobile ? "column" : "row"} 
                spacing={isMobile ? 1 : 2} 
                alignItems={isMobile ? "stretch" : "center"}
                justifyContent="space-between"
              >
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  Last updated: {stats.lastUpdated || 'Never'}
                </Typography>
                
                <Stack 
                  direction="row" 
                  spacing={1} 
                  alignItems="center"
                  justifyContent={isMobile ? "space-between" : "flex-end"}
                >
                  <Tooltip title="Refresh data">
                    <IconButton 
                      onClick={fetchData} 
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        color: isFormOnlyUser ? 'primary.main' : 'primary.main',
                        backgroundColor: isFormOnlyUser ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        transform: isFormOnlyUser ? 'scale(1.1)' : 'none',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          transform: 'rotate(180deg)',
                          transition: 'transform 0.3s ease'
                        }
                      }}
                    >
                      <Refresh fontSize={isFormOnlyUser ? "medium" : "small"} />
                    </IconButton>
                  </Tooltip>
                  
                  {!isFormOnlyUser && (
                    <Tooltip title="Export to CSV">
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleExportData}
                        disabled={submissions.length === 0}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 2,
                          px: { xs: 2, sm: 3 }
                        }}
                      >
                        {isMobile ? 'Export' : 'Export CSV'}
                      </Button>
                    </Tooltip>
                  )}
                </Stack>
              </Stack>
            </Box>

            {/* Error */}
            {error && (
              <Box sx={{ p: 2 }}>
                <Alert 
                  severity="error" 
                  onClose={() => setError('')}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.error.light}`,
                    '& .MuiAlert-message': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                >
                  {error}
                </Alert>
              </Box>
            )}

            {/* Data Table */}
            <Box sx={{ 
              width: '100%', 
              overflow: 'hidden',
              position: 'relative'
            }}>
              {!error && (
                <>
                  <TableContainer 
                    component={Paper} 
                    elevation={0} 
                    sx={{
                      maxHeight: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 300px)',
                      borderRadius: 0,
                      border: isFormOnlyUser ? `2px solid ${alpha(theme.palette.divider, 0.3)}` : 'none',
                      background: `linear-gradient(to bottom, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.5)} 100%)`,
                      '& .MuiTableCell-head': {
                        fontWeight: 'bold',
                        backgroundColor: isFormOnlyUser 
                          ? alpha(theme.palette.primary.main, 0.1) 
                          : alpha(theme.palette.primary.main, 0.05),
                        borderBottom: '2px solid',
                        borderColor: 'divider',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 0.5, sm: 2 },
                        position: 'sticky',
                        top: 0,
                        zIndex: 1
                      },
                      '& .MuiTableRow-root:nth-of-type(odd)': { 
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      },
                      '& .MuiTableRow-root:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        transition: 'background-color 0.2s ease'
                      },
                      '& .MuiTableCell-root': {
                        borderBottom: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.3),
                        padding: { xs: '8px 4px', sm: '12px 16px' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      },
                      '& .MuiTableCell-body': {
                        maxWidth: isMobile ? 120 : 200,
                        minWidth: isMobile ? 80 : 100
                      }
                    }}
                  >
                    <Table 
                      stickyHeader 
                      aria-label="submissions table" 
                      sx={{ 
                        tableLayout: isMobile ? 'auto' : 'fixed',
                        minWidth: isMobile ? 600 : '100%'
                      }}
                    >
                      <TableHead>
                        <TableRow>
                          {/* Show only key columns in mobile view */}
                          {!isMobile && columns.map((col) => (
                            <TableCell 
                              key={col.ColId} 
                              sx={{ 
                                minWidth: 120,
                                maxWidth: 200,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <Tooltip title={col.ColumnName} arrow>
                                <Typography variant="subtitle2" noWrap>
                                  {col.ColumnName}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                          ))}
                          
                          {/* In mobile view, show only 1-2 key columns and actions */}
                          {isMobile && columns.slice(0, 2).map((col) => (
                            <TableCell 
                              key={col.ColId} 
                              sx={{ 
                                minWidth: 100,
                                maxWidth: 150,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <Typography variant="subtitle2" noWrap fontSize="0.75rem">
                                {col.ColumnName}
                              </Typography>
                            </TableCell>
                          ))}
                          
                          <TableCell 
                            width={isMobile ? 80 : 120} 
                            align="center"
                            sx={{
                              minWidth: isMobile ? 80 : 120
                            }}
                          >
                            <Typography variant="subtitle2" fontSize={isMobile ? "0.75rem" : "0.875rem"}>
                              Actions
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {submissions.length > 0 ? (
                          submissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((submission) => (
                            <TableRow 
                              key={submission.SubmissionId} 
                              hover
                              sx={{
                                '&:last-child td': {
                                  borderBottom: 'none'
                                }
                              }}
                            >
                              {/* Show all columns in desktop view */}
                              {!isMobile && columns.map((col) => (
                                <TableCell key={col.ColId}>
                                  {renderCellContent(col, submission)}
                                </TableCell>
                              ))}
                              
                              {/* Show only 1-2 key columns in mobile view */}
                              {isMobile && columns.slice(0, 2).map((col) => (
                                <TableCell key={col.ColId}>
                                  {renderCellContent(col, submission)}
                                </TableCell>
                              ))}
                              
                              <TableCell align="center">
                                <Stack 
                                  direction="row" 
                                  spacing={isMobile ? 0.5 : 1} 
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  <Tooltip title="View details">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleViewClick(submission)}
                                      sx={{ 
                                        color: 'primary.main',
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        '&:hover': {
                                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                        }
                                      }}
                                    >
                                      <Visibility fontSize={isMobile ? "small" : "medium"} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit submission">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleEditClick(submission)}
                                      sx={{ 
                                        color: 'secondary.main',
                                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                        '&:hover': {
                                          backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                                        }
                                      }}
                                    >
                                      <Edit fontSize={isMobile ? "small" : "medium"}/>
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell 
                              colSpan={(isMobile ? 3 : columns.length + 1)} 
                              align="center" 
                              sx={{ 
                                p: 4,
                                borderBottom: 'none'
                              }}
                            >
                              <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography 
                                  variant="h6" 
                                  color="text.secondary"
                                  sx={{ 
                                    fontSize: { xs: '1rem', sm: '1.25rem' },
                                    mb: 1
                                  }}
                                >
                                  No submissions yet
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ opacity: 0.7 }}
                                >
                                  Submit data to see it appear here
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Pagination */}
                  {submissions.length > 0 && (
                    <TablePagination
                      rowsPerPageOptions={[10, 25, 100]}
                      component="div"
                      count={submissions.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      sx={{
                        borderTop: `1px solid ${theme.palette.divider}`,
                        '& .MuiTablePagination-toolbar': {
                          padding: { xs: 1, sm: 2 },
                          flexWrap: isMobile ? 'wrap' : 'nowrap'
                        },
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }
                      }}
                    />
                  )}
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleDialogClose} 
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : 2,
              background: theme.palette.background.paper,
              boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.3)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
            }
          }}
        >
          <DialogTitle
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'primary.contrastText',
              py: 2,
              position: 'relative'
            }}
          >
            <Typography variant="h6" component="div" fontWeight="600">
              Submission Details (ID: #{selectedSubmission?.SubmissionId})
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleDialogClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'primary.contrastText'
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent 
            dividers 
            sx={{ 
              p: 0,
              background: theme.palette.background.paper
            }}
          >
            {selectedSubmission && (
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {columns.map((col, index) => (
                  <React.Fragment key={col.ColId}>
                    <Box sx={{ 
                      pt: index === 0 ? 0 : 2, 
                      pb: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        borderRadius: 1,
                        px: 2,
                        mx: -2
                      }
                    }}>
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          mb: 1
                        }}
                      >
                        {col.ColumnName}
                      </Typography>
                      <Box sx={{ 
                        minHeight: 24,
                        display: 'flex',
                        alignItems: 'flex-start'
                      }}>
                        {renderCellContent(col, selectedSubmission, false)}
                      </Box>
                    </Box>
                    {index < columns.length - 1 && (
                      <Divider 
                        sx={{ 
                          mx: { xs: -2, sm: -3 },
                          borderBottomWidth: 1,
                          borderColor: alpha(theme.palette.divider, 0.5)
                        }} 
                      />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1, background: theme.palette.background.paper }}>
            <Button 
              onClick={handleDialogClose}
              variant="contained"
              fullWidth={isMobile}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)} 
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : 2,
              background: theme.palette.background.paper,
              boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.3)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
            }
          }}
        >
          <DialogTitle
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'secondary.contrastText',
              py: 2,
              position: 'relative'
            }}
          >
            <Typography variant="h6" component="div" fontWeight="600">
              Edit Submission (ID: #{editSubmission?.SubmissionId})
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setEditDialogOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'secondary.contrastText'
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent 
            dividers 
            sx={{ 
              p: 0,
              background: theme.palette.background.paper
            }}
          >
            <Box 
              component="form" 
              id="edit-submission-form" 
              onSubmit={handleEditSubmit}
              sx={{ p: { xs: 2, sm: 3 } }}
            >
              {editSubmission && columns.map(col => (
                <Box key={col.ColId}>
                  {renderEditInput(col)}
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1, background: theme.palette.background.paper }}>
            <Button 
              onClick={() => setEditDialogOpen(false)} 
              disabled={saving}
              variant="outlined"
              fullWidth={isMobile}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              type="submit"
              form="edit-submission-form"
              disabled={saving}
              fullWidth={isMobile}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                }
              }}
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Update Submission'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Photo View Dialog */}
        <Dialog 
          open={photoDialogOpen} 
          onClose={handlePhotoDialogClose} 
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : 2,
              overflow: 'hidden',
              background: theme.palette.background.paper,
              boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.3)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
            }
          }}
        >
          <DialogTitle
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`,
              color: 'common.white',
              py: 2,
              position: 'relative'
            }}
          >
            <Typography variant="h6" component="div" fontWeight="600">
              Photo Preview
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handlePhotoDialogClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'common.white'
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent 
            dividers 
            sx={{ 
              p: 0, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: 400,
              background: theme.palette.grey[100]
            }}
          >
            {selectedPhotoUrl ? (
              <Box sx={{ 
                p: 2,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: theme.palette.grey[100]
              }}>
                <img 
                  src={selectedPhotoUrl} 
                  alt="Submission Photo" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '70vh',
                    height: 'auto',
                    borderRadius: 8,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.3)}`
                  }} 
                />
              </Box>
            ) : (
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ p: 4 }}
              >
                No photo available.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, background: theme.palette.background.paper }}>
            <Button 
              onClick={handlePhotoDialogClose}
              variant="contained"
              fullWidth={isMobile}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ViewSubmissions;