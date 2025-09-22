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
  IconButton
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import api from '../axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const FormDetailsCreator = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formId, formNo } = location.state || {};
  const [formName, setFormName] = useState('');
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

  const userId = sessionStorage.getItem('userId');

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
        const formsResponse = await api.get('/formmaster');
        const foundForm = formsResponse.data.find(f => f.FormId == formId);
        if (foundForm) {
          setFormName(foundForm.FormName);
          setCurrentForm(foundForm);
        } else {
          throw new Error(`Form with ID ${formId} not found.`);
        }

        const columnsResponse = await api.get('/columns');
        setAllColumns(columnsResponse.data);
        setAvailableColumns(columnsResponse.data);

        if (formId && formNo) {
          const existingColumnsResponse = await api.get(
            `/formdetails/form-columns?formId=${formId}&formNo=${formNo}`
          );
          setExistingColumns(existingColumnsResponse.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch initial data.');
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

  const handleToggleColumn = (columnId) => {
    const currentIndex = tempSelectedColumns.indexOf(columnId);
    const newSelected = [...tempSelectedColumns];
    if (currentIndex === -1) {
      newSelected.push(columnId);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setTempSelectedColumns(newSelected);
  };

  const handleRemoveColumn = (columnId) => {
    const newSelected = selectedColumns.filter(id => id !== columnId);
    setSelectedColumns(newSelected);

    const newSequences = { ...sequences };
    delete newSequences[columnId];
    setSequences(newSequences);
  };

  const handleSequenceChange = (colId, value) => {
    setSequences((prev) => ({ ...prev, [colId]: value }));
    if (sequenceErrors[colId]) {
      setSequenceErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[colId];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedColumns.length === 0) {
      setSubmitStatus({ type: 'warning', message: 'Please select at least one column.' });
      return;
    }

    const newErrors = {};
    const sequenceValues = selectedColumns.map(colId => sequences[colId]);
    let hasErrors = false;

    selectedColumns.forEach(colId => {
      if (!sequences[colId]) {
        newErrors[colId] = "Sequence is required.";
        hasErrors = true;
      }
    });

    const sequenceCounts = sequenceValues.reduce((acc, seq) => {
      if (seq) acc[seq] = (acc[seq] || 0) + 1;
      return acc;
    }, {});

    selectedColumns.forEach(colId => {
      const seq = sequences[colId];
      if (seq && sequenceCounts[seq] > 1) {
        newErrors[colId] = "Sequence must be unique.";
        hasErrors = true;
      }
    });

    setSequenceErrors(newErrors);
    if (hasErrors) return;

    setSubmitStatus({ type: 'info', message: 'Submitting...' });

    const requests = selectedColumns.map(colId => {
      return api.post('/formdetails/insert-formdetails', {
        formId,
        colId,
        sequenceNo: sequences[colId],
        active: 1,
        formNo: formNo,
      });
    });

    try {
      await Promise.all(requests);
      setSubmitStatus({ type: 'success', message: 'Columns added successfully!' });
      toast.success('Columns added successfully!');
      setSelectedColumns([]);
      setSequences({});
      setTimeout(() => setSubmitStatus(null), 5000);

      setTimeout(() => {
        navigate('/create-column-table', { state: { formId, formNo } });
      }, 1500);
    } catch (err) {
      setSubmitStatus({ type: 'error', message: err.response?.data?.message || 'An error occurred.' });
      toast.error(err.response?.data?.message || 'An error occurred.');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="h5" gutterBottom>Add Columns to Form</Typography>
           
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth label="Form Name" value={formName} InputProps={{ readOnly: true }} variant="filled" />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                  fullWidth
                >
                  Select Columns
                </Button>
              </Grid>

              {submitStatus && (
                <Grid item xs={12}>
                  <Alert severity={submitStatus.type}>{submitStatus.message}</Alert>
                </Grid>
              )}
            </Grid>

            {/* Selected Columns with Sequence Inputs */}
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
                          <TableCell>Sequence Number</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedColumns.map(colId => {
                          const column = allColumns.find(c => c.ColumnId === colId);
                          return (
                            <TableRow key={colId}>
                              <TableCell>{column?.ColumnName}</TableCell>
                              <TableCell>{column?.DataType}</TableCell>
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

                  {/* ✅ Submit button should be here */}
                  <Box sx={{ mt: 2 }}>
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                      Add Selected Columns
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Existing Columns Table */}
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

      {/* Column Selection Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Select Columns</DialogTitle>
        <DialogContent>
          <List>
            {availableColumns.map((col) => (
              <ListItem key={col.ColumnId} button onClick={() => handleToggleColumn(col.ColumnId)}>
                <Checkbox checked={tempSelectedColumns.indexOf(col.ColumnId) !== -1} />
                <ListItemText primary={col.ColumnName} secondary={`ID: ${col.ColumnId}, Type: ${col.DataType}`} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmDialog} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FormDetailsCreator;
