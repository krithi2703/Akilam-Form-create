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
  TablePagination
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh,
  Visibility,
  Download,
  Edit,
  Logout as LogoutIcon
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon
import api from "../axiosConfig";
import { sendWhatsAppMessage } from '../whatsappService';
import { validateField } from "../utils/validationUtils";



// Helper to construct base URL for assets
const getBaseUrl = () => {
  const fullUrl = api.defaults.baseURL;
  return fullUrl.replace('/api', '');
};

const ViewSubmissions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();
  const theme = useTheme();
  const { formId: formIdFromParams } = useParams();

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
    navigate(`/${formId}`, { replace: true });
  };

  const fetchData = async () => {
    // Parse formId as integer
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

      // Determine which API endpoint to call based on user type
      const endpoint = isFormOnlyUser
        ? `/formvalues/values?formId=${parsedFormId}&formNo=${parsedFormNo}`
        : `/formvalues/values/all?formId=${parsedFormId}&formNo=${parsedFormNo}`;

      // Use the API instance with headers
      const valuesResponse = await api.get(endpoint);

      if (valuesResponse.data && valuesResponse.data.length > 0) {
        let { submissions: groupedSubmissions, columns: dynamicColumns, formName: name } = valuesResponse.data[0];
        
        // Fetch validation rules for the form
        const validationRulesResponse = await api.get(`/validation/${parsedFormId}`);
        const formValidationRulesMap = new Map();
        validationRulesResponse.data.forEach(rule => {
          formValidationRulesMap.set(rule.ColId, rule.ValidationList);
        });

        // Merge validation rules into columns
        dynamicColumns = dynamicColumns.map(col => ({
          ...col,
          Validation: formValidationRulesMap.get(col.ColId) || null, // Add Validation property
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
  }, [formId, formNo, userId, isFormOnlyUser]); // Depend on formId and formNo (which now correctly combine state/query)

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
    setEditSubmission({ ...submission }); // clone for editing

    // Fetch options for select, radio, checkbox
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
      setEditDialogOpen(true); // Open dialog after options are fetched

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

      // Append all values, handling files separately
      for (const colId in editSubmission.values) {
        if (Object.hasOwnProperty.call(editSubmission.values, colId)) {
          const value = editSubmission.values[colId];
          if (value instanceof File) {
            formData.append(colId, value); // Append file directly
          } else if (Array.isArray(value)) {
            // For checkbox arrays, append each item
            value.forEach(item => formData.append(colId, item));
          } else if (typeof value === 'boolean') {
            formData.append(colId, value ? '1' : '0'); // Convert boolean to '1' or '0'
          } else {
            formData.append(colId, value); // Append other values as strings
          }
        }
      }

      await api.put(
        `/formvalues/values/${submissionId}`,
        formData, // Send FormData
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Submission updated successfully!');

      console.log("Attempting to send WhatsApp message for update...");
      console.log("Edit Submission Data:", editSubmission);
      console.log("Form Name:", formName);

      if (editSubmission.Emailormobileno && formName) {
        const message = `Your form "${formName}" has been updated successfully.`;
        console.log("Message:", message);
        try {
          await sendWhatsAppMessage(editSubmission.Emailormobileno, message);
          toast.success("WhatsApp notification sent.");
        } catch (whatsappError) {
          console.error("WhatsApp Error:", whatsappError);
          toast.error("Failed to send WhatsApp notification.");
        }
      } else {
        console.log("Cannot send WhatsApp message because Emailormobileno or formName is missing.");
      }

      setEditDialogOpen(false);
      fetchData(); // refresh the data
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
          />
        );
      
      case 'boolean':
      case 'checkbox':
        return (
          <FormControl component="fieldset" fullWidth sx={{ mb: 2 }} error={isError}>
            <FormLabel component="legend" required={col.IsValid}>{ColumnName}</FormLabel>
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
                  />
                }
                label={option}
              />
            ))}
            {isError && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        );
      
      case 'select':
        return (
          <FormControl fullWidth sx={{ mb: 2 }} error={isError}>
            <InputLabel required={col.IsValid}>{ColumnName}</InputLabel>
            <Select
              value={value}
              label={ColumnName}
              onChange={(e) => handleEditChange(ColId, e.target.value)}
              required={col.IsValid}
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
            <FormLabel component="legend" required={col.IsValid}>{ColumnName}</FormLabel>
            <RadioGroup
              aria-label={ColumnName}
              name={ColId}
              value={value}
              onChange={(e) => handleEditChange(ColId, e.target.value)}
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
          />
        );
      
      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={ColumnName}
            value={value}
            onChange={(e) => handleEditChange(ColId, e.target.value)}
            sx={{ mb: 2 }}
            required={col.IsValid}
            error={isError}
            helperText={errorMessage}
          />
        );
      case 'file':
        return (
          <>
            <Typography variant="body2" gutterBottom>{ColumnName}</Typography>
            <TextField
              fullWidth
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                // No client-side size validation for 'file' type, as page count is server-side
                handleEditChange(ColId, file);
              }}
              sx={{ mb: 2 }}
              required={col.IsValid}
              error={isError}
              helperText={errorMessage || 'Only 2-3 page PDFs allowed'}
            />
            {value && <Typography variant="caption">Current file: {value}</Typography>}
          </>
        );
      case 'photo':
        const photoSrc = value && (value.startsWith('http://') || value.startsWith('https://')) ? value : `${getBaseUrl()}${value}`;
        return (
          <>
            <Typography variant="body2" gutterBottom>{ColumnName}</Typography>
            <TextField
              fullWidth
              type="file"
              inputProps={{ accept: 'image/*' }}
              onChange={(e) => {
                const file = e.target.files[0];
                const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
                if (file && file.size > MAX_PHOTO_SIZE_BYTES) {
                  toast.error(`Photo "${file.name}" exceeds the 2MB limit.`);
                  e.target.value = null; // Clear the input
                  handleEditChange(ColId, null);
                } else {
                  handleEditChange(ColId, file);
                }
              }}
              sx={{ mb: 2 }}
              required={col.IsValid}
              error={isError}
              helperText={errorMessage || 'Max 2MB'}
            />
            {value && <img src={photoSrc} alt="preview" style={{ width: '100px', marginTop: '10px' }}/>}
          </>
        );
      default: // text
        return (
          <TextField
            fullWidth
            label={ColumnName}
            value={value}
            onChange={(e) => handleEditChange(ColId, e.target.value)}
            sx={{ mb: 2 }}
            required={col.IsValid}
            error={isError}
            helperText={errorMessage}
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

  const renderCellContent = (col, submission) => {
    const value = submission.values[col.ColId];
    if (!value) {
      return (
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          Not provided
        </Typography>
      );
    }

    if (col.DataType.toLowerCase() === 'photo') {
      return (
        <Button variant="outlined" size="small" onClick={() => handleViewPhotoClick(value)}>
          View Photo
        </Button>
      );
    } else if (col.DataType.toLowerCase() === 'file') {
      const fileHref = value.startsWith('http://') || value.startsWith('https://')
        ? value
        : `${getBaseUrl()}${value}`;
      return <a href={fileHref} target="_blank" rel="noopener noreferrer">View File</a>;
    }

    return value;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading Submissions...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      {isFormOnlyUser && (
        <AppBar position="static" color="primary" elevation={1}>
          <Toolbar>
            
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: theme.palette.primary.contrastText }}>
              {formName || 'Form Submissions'}
            </Typography>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}
      
      <Container maxWidth="xl" sx={{ py: isFormOnlyUser ? 2 : 4 }}>
        <Card elevation={isFormOnlyUser ? 0 : 3} sx={{ borderRadius: isFormOnlyUser ? 0 : 2, bgcolor: 'background.paper' }}>
          <CardContent sx={{ p: 0 }}>
            {/* Header Section - Only show for non-form-only users */}
            {!isFormOnlyUser && (
              <Box sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                p: 3,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8
              }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid>
                    <IconButton
                      onClick={() => navigate(-1)}
                      sx={{ color: theme.palette.primary.contrastText }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  </Grid>
                  <Grid xs="auto">
                    <Typography variant="h4" fontWeight="bold">
                      {formName || 'Unknown Form'}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                      View all submitted data for this form
                    </Typography>
                  </Grid>
                  <Grid>
                    <Chip
                      label={`${stats.total} submissions`}
                      variant="outlined"
                      sx={{ color: theme.palette.primary.contrastText, borderColor: 'rgba(255,255,255,0.5)' }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Action Bar */}
            <Box sx={{ p: 2, backgroundColor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid>
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {stats.lastUpdated || 'Never'}
                  </Typography>
                </Grid>
                <Grid xs="auto" />
                <Grid>
                  <Tooltip title="Refresh data">
                    <IconButton 
                      onClick={fetchData} 
                      size="large"
                      sx={{
                        color: isFormOnlyUser ? 'primary.main' : 'inherit',
                        transform: isFormOnlyUser ? 'scale(1.2)' : 'none', // Increase size for form-only user
                      }}
                    >
                      <Refresh sx={{ fontSize: isFormOnlyUser ? '2rem' : '1.5rem' }} hidden={isFormOnlyUser} />
                    </IconButton>
                  </Tooltip>
                </Grid>
                {!isFormOnlyUser && (
                  <Grid>
                    <Tooltip title="Export to CSV">
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleExportData}
                        disabled={submissions.length === 0}
                      >
                        Export
                      </Button>
                    </Tooltip>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Error */}
            {error && (
              <Box sx={{ p: 2 }}>
                <Alert severity="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              </Box>
            )}

            {/* Data Table */}
            <Box sx={{ width: '100%', overflow: 'hidden' }}>
              {!error && (
                <TableContainer component={Paper} elevation={0} sx={{
                  maxHeight: 'calc(100vh - 250px)', 
                  borderRadius: 0,
                  borderRight: isFormOnlyUser ? '3px solid #999' : 'none', // Thicker right border
                  borderLeft: isFormOnlyUser ? '3px solid #999' : 'none', // Thicker left border
                  '& .MuiTableCell-head': {
                    fontWeight: 'bold',
                    backgroundColor: isFormOnlyUser ? '#e9ecef' : 'action.hover', // Header color
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                  },
                  '& .MuiTableRow-root:nth-of-type(odd)': { 
                    backgroundColor: 'action.hover',
                  },
                  '& .MuiTableCell-root': {
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    padding: '12px 16px', 
                    borderRight: isFormOnlyUser ? '1px solid #dee2e6' : 'none', // Vertical line
                    borderLeft: isFormOnlyUser ? '1px solid #dee2e6' : 'none', // Vertical line
                  },
                  '& .MuiTableCell-root:last-child': {
                    borderRight: 'none',
                  },
                  '& .MuiTableCell-root:first-of-type': {
                    borderLeft: 'none',
                  }                }}>
                  <Table stickyHeader aria-label="submissions table">
                    <TableHead>
                      <TableRow>
                        
                        {columns.map((col) => (
                          <TableCell key={col.ColId}>{col.ColumnName}</TableCell>
                        ))}
                        <TableCell width="120" align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissions.length > 0 ? (
                        submissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((submission) => (
                          <TableRow key={submission.SubmissionId} hover>
                            
                            {columns.map((col) => (
                              <TableCell key={col.ColId}>
                                {renderCellContent(col, submission)}
                              </TableCell>
                            ))}
                            <TableCell align="center">
                              {!isFormOnlyUser && (
                                <Tooltip title="View details">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleViewClick(submission)}
                                    sx={{ color: 'primary.main', mr: 1 }}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {isFormOnlyUser && (
                                <Tooltip title="Edit submission">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleEditClick(submission)}
                                    sx={{ color: 'secondary.main' }}
                                  >
                                    <Edit fontSize="small"/>
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length + 1} align="center" sx={{ p: 4 }}>
                            <Typography variant="h6" color="text.secondary">No submissions yet</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={submissions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>

        {/* View Dialog - Only show for non-form-only users */}
        {!isFormOnlyUser && (
          <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md">
            <DialogTitle>
              Submission Details (ID: #{selectedSubmission?.SubmissionId})
            </DialogTitle>
            <DialogContent dividers>
              {selectedSubmission && (
                <Grid container spacing={2}>
                  {columns.map((col) => (
                    <Grid xs={12} sm={6} key={col.ColId}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {col.ColumnName}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {renderCellContent(col, selectedSubmission)}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Close</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm">
          <DialogTitle>
            Edit Submission (ID: #{editSubmission?.SubmissionId})
          </DialogTitle>
          <DialogContent dividers>
            <Box component="form" id="edit-submission-form" onSubmit={handleEditSubmit}>
              {editSubmission && columns.map(col => (
                <Box key={col.ColId}>
                  {renderEditInput(col)}
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              type="submit"
              form="edit-submission-form"
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Photo View Dialog */}
        <Dialog open={photoDialogOpen} onClose={handlePhotoDialogClose} maxWidth="sm">
          <DialogTitle>
            Photo Preview
            <IconButton
              aria-label="close"
              onClick={handlePhotoDialogClose}
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
          <DialogContent dividers>
            {selectedPhotoUrl ? (
              <img src={selectedPhotoUrl} alt="Submission Photo" style={{ maxWidth: '100%', height: 'auto' }} />
            ) : (
              <Typography>No photo available.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePhotoDialogClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ViewSubmissions;
