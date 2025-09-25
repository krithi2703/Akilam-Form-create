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
  FormLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh,
  Visibility,
  Download,
  Edit,
  Logout as LogoutIcon
} from '@mui/icons-material';
import api from "../axiosConfig";

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

  // View Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Edit Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSubmission, setEditSubmission] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editColumnOptions, setEditColumnOptions] = useState({});

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
        const { submissions: groupedSubmissions, columns: dynamicColumns, formName: name } = valuesResponse.data[0];
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

  // View
  const handleViewClick = (submission) => {
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedSubmission(null);
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
            dataType === 'select' ? `/dropdown-dtl/${col.ColId}` :
            dataType === 'radio' ? `/radiobox-dtl/${col.ColId}` :
            `/checkbox-dtl/${col.ColId}`;
          
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

  const handleEditSave = async () => {
    if (!editSubmission) return;

    setSaving(true);
    try {
      const submissionId = editSubmission.SubmissionId.toString().replace(':', '/');
      await api.put(
        `/formvalues/values/${submissionId}`,
        {
          formId: parseInt(formId), // Ensure formId is parsed as integer here too
          values: editSubmission.values
        }
      );

      toast.success('Submission updated successfully!');

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

  // Helper function to render input based on column type
  const renderEditInput = (col) => {
    const { ColId, ColumnName, DataType } = col;
    const value = editSubmission?.values[ColId] || '';
    const options = editColumnOptions[ColId] || [];

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
          />
        );
      
      case 'boolean':
      case 'checkbox':
        return (
          <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
            <FormLabel component="legend">{ColumnName}</FormLabel>
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
          </FormControl>
        );
      
      case 'select':
        return (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{ColumnName}</InputLabel>
            <Select
              value={value}
              label={ColumnName}
              onChange={(e) => handleEditChange(ColId, e.target.value)}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'radio':
        return (
          <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
            <FormLabel component="legend">{ColumnName}</FormLabel>
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
          />
        );
      case 'file':
        return (
          <>
            <Typography variant="body2" gutterBottom>{ColumnName}</Typography>
            <TextField
              fullWidth
              type="file"
              onChange={(e) => handleEditChange(ColId, e.target.files[0])}
              sx={{ mb: 2 }}
            />
            {value && <Typography variant="caption">Current file: {value}</Typography>}
          </>
        );
      case 'photo':
        return (
          <>
            <Typography variant="body2" gutterBottom>{ColumnName}</Typography>
            <TextField
              fullWidth
              type="file"
              inputProps={{ accept: 'image/*' }}
              onChange={(e) => handleEditChange(ColId, e.target.files[0])}
              sx={{ mb: 2 }}
            />
            {value && <img src={`http://localhost:5000/${value}`} alt="preview" style={{ width: '100px', marginTop: '10px' }}/>}
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
      return <img src={`http://localhost:5000/${value}`} alt="submission" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />; 
    } else if (col.DataType.toLowerCase() === 'file') {
      return <a href={`http://localhost:5000/${value}`} target="_blank" rel="noopener noreferrer">View File</a>;
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
                  <Grid item>
                    <IconButton
                      onClick={() => navigate(-1)}
                      sx={{ color: theme.palette.primary.contrastText }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h4" fontWeight="bold">
                      {formName || 'Unknown Form'}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                      View all submitted data for this form
                    </Typography>
                  </Grid>
                  <Grid item>
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
                <Grid item>
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {stats.lastUpdated || 'Never'}
                  </Typography>
                </Grid>
                <Grid item xs />
                <Grid item>
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
                  <Grid item>
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
                  '& .MuiTableCell-root:first-child': {
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
                        submissions.map((submission) => (
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
          </CardContent>
        </Card>

        {/* View Dialog - Only show for non-form-only users */}
        {!isFormOnlyUser && (
          <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
            <DialogTitle>
              Submission Details (ID: #{selectedSubmission?.SubmissionId})
            </DialogTitle>
            <DialogContent dividers>
              {selectedSubmission && (
                <Grid container spacing={2}>
                  {columns.map((col) => (
                    <Grid item xs={12} sm={6} key={col.ColId}>
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
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Edit Submission (ID: #{editSubmission?.SubmissionId})
          </DialogTitle>
          <DialogContent dividers>
            {editSubmission && columns.map(col => (
              <Box key={col.ColId}>
                {renderEditInput(col)}
              </Box>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleEditSave}
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ViewSubmissions;
