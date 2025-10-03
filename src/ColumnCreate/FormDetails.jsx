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
  List,
  ListItem,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, Rule as RuleIcon } from '@mui/icons-material';
import api from '../axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ColumnOptionEditorDialog from './ColumnOptionEditorDialog';

// New Dialog for Validation Rules
const ValidationRuleDialog = ({ open, onClose, onSave, validationOptions, initialValue }) => {
  const [selectedValue, setSelectedValue] = useState(initialValue || '');

  useEffect(() => {
    setSelectedValue(initialValue || '');
  }, [initialValue, open]);

  const handleSave = () => {
    onSave(selectedValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Set Validation Rule</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="validation-select-label">Validation</InputLabel>
          <Select
            labelId="validation-select-label"
            value={selectedValue}
            label="Validation"
            onChange={(e) => setSelectedValue(e.target.value)}
          >
            <MenuItem value=""></MenuItem>
            {validationOptions.map((option) => (
              <MenuItem key={option.Id} value={option.Id}>
                {option.ValidationList}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
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
        }

        // --- Fetch available validation types ---
        const validationTypesResponse = await api.get('/validation/types');
        //console.log('Validation Types API Response:', validationTypesResponse.data);
        setAvailableValidations(validationTypesResponse.data);

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

    if (!bannerImageFile) {
      toast.error("Please upload a banner image.");
      setSubmitStatus({ type: 'error', message: 'Banner image is mandatory.' });
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

    setSubmitStatus({ type: 'info', message: 'Uploading banner image...' });

    const bannerImagePath = await handleUploadBannerImage();
    if (!bannerImagePath) {
        setSubmitStatus({ type: 'error', message: 'Failed to upload banner image. Please try again.' });
        return;
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

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h5" component="h1">Add Columns to Form</Typography>
              <Stack spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 300 } }}>
                  {bannerImagePreviewUrl && (
                    <Box sx={{ width: 100, height: 100, border: '1px solid #ddd', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img src={bannerImagePreviewUrl} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </Box>
                  )}
                  <label htmlFor="banner-image-upload">
                    <Button variant="contained" component="span" size="small">
                      {bannerImagePreviewUrl ? 'Change Banner' : 'Upload Banner *'}
                    </Button>
                  </label>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="banner-image-upload"
                    type="file"
                    onChange={handleBannerFileChange}
                  />
              </Stack>
            </Box>
           
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField fullWidth label="Form Name" value={formName} InputProps={{ readOnly: true }} variant="filled" />
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                    sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                  >
                    Select Columns
                  </Button>
                </Stack>
              </Grid>

              {submitStatus && (
                <Grid item xs={12}>
                  <Alert severity={submitStatus.type}>{submitStatus.message}</Alert>
                </Grid>
              )}
            </Grid>

            {selectedColumns.length > 0 && (
              <Card sx={{ mt: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Selected Columns & Sequence Numbers</Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Column Name</TableCell>
                          <TableCell>Data Type</TableCell>
                          <TableCell>Validation Rule</TableCell>
                          <TableCell>Sequence Number</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedColumns.map(colId => {
                          const column = allColumns.find(c => c.ColumnId === colId);
                          const validationId = columnValidations[colId];
                          const validation = availableValidations.find(v => v.Id === validationId);
                          return (
                            <TableRow key={colId}>
                              <TableCell>{column?.ColumnName}</TableCell>
                              <TableCell>{column?.DataType}</TableCell>
                              <TableCell>{validation ? validation.ValidationList : 'None'}</TableCell>
                              <TableCell>
                                <TextField
                                  type="number"
                                  value={sequences[colId] || ''}
                                  onChange={(e) => handleSequenceChange(colId, e.target.value)}
                                  required
                                  fullWidth
                                  error={!!sequenceErrors[colId]}
                                  helperText={sequenceErrors[colId]}
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton onClick={() => handleRemoveColumn(colId)}>
                                  <CloseIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ mt: 2 }}>
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                      Add Selected Columns
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {existingColumns.length > 0 && (
              <Card sx={{ mt: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Existing Columns in Form</Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Column ID</TableCell>
                          <TableCell>Column Name</TableCell>
                          <TableCell>Data Type</TableCell>
                          <TableCell>Sequence</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {existingColumns.map((col) => (
                          <TableRow key={col.ColId}>
                            <TableCell>{col.ColId}</TableCell>
                            <TableCell>{col.ColumnName}</TableCell>
                            <TableCell>{col.DataType}</TableCell>
                            <TableCell>{col.SequenceNo}</TableCell>
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Select Columns</DialogTitle>
        <DialogContent>
          <List>
            {availableColumns.map((col) => {
              const isExisting = existingColumnIds.includes(col.ColumnId);
              return (
                <ListItem key={col.ColumnId} button="true" disabled={isExisting}>
                  <Checkbox
                    checked={isExisting || tempSelectedColumns.indexOf(col.ColumnId) !== -1}
                    disabled={isExisting}
                    onChange={() => handleToggleColumn(col)}
                  />
                  <ListItemText 
                    primary={col.ColumnName} 
                    secondary={`ID: ${col.ColumnId}, Type: ${col.DataType}${isExisting ? ' (Already in form)' : ''}`} 
                  />

                  {!(col.DataType?.toLowerCase() === 'select' ||
                    col.DataType?.toLowerCase() === 'radio' ||
                    col.DataType?.toLowerCase() === 'checkbox') && 
                   !isExisting && 
                   tempSelectedColumns.includes(col.ColumnId) && (
                    <>
                      {columnValidations[col.ColumnId] ? ( // If validation is set
                        <Button
                          variant="outlined"
                          color="error" // Use error color for clear/cancel
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearValidationRule(col.ColumnId);
                          }}
                          sx={{ ml: 2, textTransform: 'none' }}
                        >
                          Clear Validation
                        </Button>
                      ) : ( // If no validation is set
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenValidationDialog(col);
                          }}
                          sx={{ ml: 2, textTransform: 'none' }}
                        >
                          Is Require
                        </Button>
                      )}
                    </>
                  )}
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmDialog} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>

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

      {/* --- Validation Rule Dialog --- */}
      {validationDialogOpen && selectedColForValidation && (
        <ValidationRuleDialog
          open={validationDialogOpen}
          onClose={handleCloseValidationDialog}
          onSave={handleSaveValidationRule}
          validationOptions={availableValidations}
          initialValue={columnValidations[selectedColForValidation.ColumnId]}
        />
      )}

    </Container>
  );
};

export default FormDetails;
