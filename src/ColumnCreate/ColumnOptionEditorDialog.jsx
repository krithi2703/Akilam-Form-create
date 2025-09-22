import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../axiosConfig';
import { toast } from 'react-toastify';

const ColumnOptionEditorDialog = ({ open, onClose, onSuccessfulSubmit, colId, dataType, columnName }) => {
  const [optionName, setOptionName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [fetchingOptions, setFetchingOptions] = useState(true);

  const getApiEndpoints = useCallback(() => {
    switch (dataType?.toLowerCase()) {
      case 'select':
        return { insert: '/dropdown-dtl/insert', fetch: `/dropdown-dtl/${colId}` };
      case 'radio':
        return { insert: '/radiobox-dtl/insert', fetch: `/radiobox-dtl/${colId}` };
      case 'checkbox':
        return { insert: '/checkbox-dtl/insert', fetch: `/checkbox-dtl/${colId}` };
      default:
        return { insert: null, fetch: null };
    }
  }, [dataType, colId]);

  const getOptionLabel = useCallback(() => {
    switch (dataType?.toLowerCase()) {
      case 'select':
        return 'Dropdown Option Name';
      case 'radio':
        return 'Radio Button Option Name';
      case 'checkbox':
        return 'Checkbox Option Name';
      default:
        return 'Option Name';
    }
  }, [dataType]);

  const fetchOptions = useCallback(async () => {
    if (!colId || !dataType) return;

    setFetchingOptions(true);
    setError(null);
    const { fetch: fetchEndpoint } = getApiEndpoints();

    if (!fetchEndpoint) {
      setError('Unsupported data type for fetching options.');
      setFetchingOptions(false);
      return;
    }

    try {
      const response = await api.get(fetchEndpoint);
      const normalizedOptions = response.data.map(item => {
        if (dataType?.toLowerCase() === 'select') return { id: item.Id, name: item.DropdownName, isActive: item.isActive };
        if (dataType?.toLowerCase() === 'radio') return { id: item.Id, name: item.RadioBoxName, isActive: item.isactive };
        if (dataType?.toLowerCase() === 'checkbox') return { id: item.Id, name: item.checkBoxName, isActive: item.isactive };
        return item;
      });
      setCurrentOptions(normalizedOptions);
    } catch (err) {
      console.error(`Error fetching ${dataType} options:`, err);
      setError(`Failed to fetch existing ${dataType} options.`);
    } finally {
      setFetchingOptions(false);
    }
  }, [colId, dataType, getApiEndpoints]);

  useEffect(() => {
    if (open && colId && dataType) {
      setOptionName('');
      setIsActive(true);
      setError(null);
      setSubmitStatus(null);
      fetchOptions();
    }
  }, [open, colId, dataType, fetchOptions]);

  const handleAddOptionToList = (event) => {
    event.preventDefault();
    if (!optionName.trim()) {
      setError('Option name cannot be empty.');
      return;
    }
    setError(null);

    const newOption = {
      id: `temp-${Date.now()}`,
      name: optionName,
      isActive: isActive,
      isNew: true,
    };

    setCurrentOptions(prevOptions => [...prevOptions, newOption]);
    setOptionName('');
    setIsActive(true);
  };

  const handleFinalSubmit = async () => {
    const { insert: insertEndpoint } = getApiEndpoints();
    if (!insertEndpoint) {
      setError('Unsupported data type for adding options.');
      return;
    }

    const newOptions = currentOptions.filter(option => option.isNew);

    if (newOptions.length === 0) {
      toast.info("No new options to submit.");
      if (onSuccessfulSubmit) onSuccessfulSubmit();
      else onClose();
      return;
    }

    setLoading(true);
    setError(null);
    setSubmitStatus(null);

    try {
      for (const option of newOptions) {
        const payload = {
          colId,
          isActive: option.isActive ? 1 : 0,
        };
        switch (dataType?.toLowerCase()) {
          case 'select':
            payload.dropdownName = option.name;
            break;
          case 'radio':
            payload.radioBoxName = option.name;
            break;
          case 'checkbox':
            payload.checkBoxName = option.name;
            break;
          default:
            break;
        }
        await api.post(insertEndpoint, payload);
      }

      toast.success('New options submitted successfully!');
      window.dispatchEvent(new CustomEvent('optionsUpdated'));
      if (onSuccessfulSubmit) {
        onSuccessfulSubmit();
      } else {
        onClose();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit new options.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Options for {columnName} (ID: {colId})</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>Data Type: {dataType}</Typography>
        <Box component="form" onSubmit={handleAddOptionToList} noValidate sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label={getOptionLabel()}
            value={optionName}
            onChange={(e) => setOptionName(e.target.value)}
            margin="normal"
            required
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                name="isActive"
                color="primary"
              />
            }
            label="Is Active"
            sx={{ mt: 1, mb: 2 }}
          />
          {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
          {submitStatus && <Alert severity={submitStatus.type} sx={{ my: 2 }}>{submitStatus.message}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            fullWidth
            sx={{ mt: 2 }}
          >
            Add Option
          </Button>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Existing & New Options:</Typography>
          {fetchingOptions ? (
            <CircularProgress />
          ) : currentOptions.length === 0 ? (
            <Typography>No options added yet.</Typography>
          ) : (
            <List>
              {currentOptions.map((option) => (
                <ListItem key={option.id} secondaryAction={
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                }>
                  <ListItemText 
                    primary={option.name} 
                    secondary={`Active: ${option.isActive ? 'Yes' : 'No'}${option.isNew ? ' (New)' : ''}`} 
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {loading && <CircularProgress size={24} sx={{ mr: 2 }} />}
        <Button onClick={onClose} disabled={loading}>Close</Button>
        <Button onClick={handleFinalSubmit} color="primary" variant="contained" disabled={loading}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnOptionEditorDialog;