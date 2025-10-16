import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import api from '../axiosConfig';
import { toast } from 'react-toastify';
import { RingLoader } from 'react-spinners';

const ColumnOptionEditorDialog = ({ open, onClose, onSuccessfulSubmit, colId, dataType, columnName, formId }) => {
  const [optionName, setOptionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [fetchingOptions, setFetchingOptions] = useState(true);
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [editingOptionName, setEditingOptionName] = useState('');

  // Determine API endpoints based on type
  const getApiEndpoints = useCallback(() => {
    switch (dataType?.toLowerCase()) {
      case 'select':
        return {
          insert: '/dropdown-dtl/insert',
          fetch: `/dropdown-dtl/${colId}?formId=${formId}`,
          update: '/dropdown-dtl/update',
          delete: '/dropdown-dtl/delete',
        };
      case 'radio':
        return {
          insert: '/radiobox-dtl/insert',
          fetch: `/radiobox-dtl/${colId}?formId=${formId}`,
          update: '/radiobox-dtl/update',
          delete: '/radiobox-dtl/delete',
        };
      case 'checkbox':
        return {
          insert: '/checkbox-dtl/insert',
          fetch: `/checkbox-dtl/${colId}?formId=${formId}`,
          update: '/checkbox-dtl/update',
          delete: '/checkbox-dtl/delete',
        };
      default:
        return { insert: null, fetch: null, update: null, delete: null };
    }
  }, [dataType, colId, formId]);

  const getOptionLabel = useCallback(() => {
    switch (dataType?.toLowerCase()) {
      case 'select': return 'Dropdown Option Name';
      case 'radio': return 'Radio Button Option Name';
      case 'checkbox': return 'Checkbox Option Name';
      default: return 'Option Name';
    }
  }, [dataType]);

  // Fetch existing options
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
        const id = item.DropdownId || item.RadioBoxId || item.CheckBoxId;
        const name = item.DropdownName || item.RadioBoxName || item.CheckBoxName;
        return { id: id || `temp-${Date.now()}-${Math.random()}`, originalItemId: id, name, isActive: item.IsActive ?? 1, isNew: false };
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
      setError(null);
      setEditingOptionId(null);
      setEditingOptionName('');
      fetchOptions();
    }
  }, [open, colId, dataType, fetchOptions]);

  // Add new option to local state
  const handleAddOptionToList = (event) => {
    event.preventDefault();
    if (!optionName.trim()) { setError('Option name cannot be empty.'); return; }
    setError(null);
    const newOption = { id: `temp-${Date.now()}`, name: optionName, isActive: 1, isNew: true };
    setCurrentOptions(prev => [...prev, newOption]);
    setOptionName('');
  };

  const handleDeleteExistingOption = async (optionId) => {
    if (!window.confirm('Are you sure you want to delete this option?')) return;
    const { delete: deleteEndpoint } = getApiEndpoints();
    const option = currentOptions.find(opt => opt.id === optionId);
    if (!option || !option.originalItemId) { toast.error('Cannot delete option.'); return; }
    setLoading(true);
    try {
      await api.delete(`${deleteEndpoint}/${option.originalItemId}`);
      toast.success('Option deleted successfully');
      fetchOptions();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete option.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOption = (option) => {
    setEditingOptionId(option.id);
    setEditingOptionName(option.name);
  };

  const handleEditKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSaveEdit();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingOptionName.trim()) { setError('Option name cannot be empty'); return; }
    const option = currentOptions.find(opt => opt.id === editingOptionId);
    if (option && !option.isNew && option.originalItemId) {
      const { update: updateEndpoint } = getApiEndpoints();
      const payload = { colId, formId };
      if (dataType === 'select') payload.dropdownName = editingOptionName;
      if (dataType === 'radio') payload.radioBoxName = editingOptionName;
      if (dataType === 'checkbox') payload.checkBoxName = editingOptionName;
      setLoading(true);
      try {
        await api.put(`${updateEndpoint}/${option.originalItemId}`, payload);
        toast.success('Option updated successfully');
        fetchOptions();
      } catch (err) {
        console.error(err);
        toast.error('Failed to update option.');
      } finally {
        setLoading(false);
        setEditingOptionId(null);
        setEditingOptionName('');
      }
    } else {
      // New option: just update local state
      setCurrentOptions(prev => prev.map(opt => opt.id === editingOptionId ? { ...opt, name: editingOptionName } : opt));
      setEditingOptionId(null);
      setEditingOptionName('');
    }
  };

  const handleFinalSubmit = async () => {
    const { insert: insertEndpoint } = getApiEndpoints();
    const newOptions = currentOptions.filter(opt => opt.isNew);
    if (!newOptions.length) { toast.info('No new options to submit'); onSuccessfulSubmit?.(); return; }
    setLoading(true);
    try {
      for (const option of newOptions) {
        const payload = { colId, formId, isActive: option.isActive };
        if (dataType === 'select') payload.dropdownName = option.name;
        if (dataType === 'radio') payload.radioBoxName = option.name;
        if (dataType === 'checkbox') payload.checkBoxName = option.name;
        await api.post(insertEndpoint, payload);
      }
      toast.success('New options submitted successfully');
      onSuccessfulSubmit?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit new options.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Options for {columnName}</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1">Data Type: {dataType}</Typography>
        <Box component="form" onSubmit={handleAddOptionToList} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label={getOptionLabel()}
            value={optionName}
            onChange={(e) => setOptionName(e.target.value)}
            required
          />
          {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained" startIcon={<AddIcon />} sx={{ mt: 2 }}>Add Option</Button>
        </Box>
        <Box sx={{ mt: 3 }}>
          {fetchingOptions ? <RingLoader color="#36d7b7" /> : (
            <List>
              {currentOptions.map((option, index) => (
                <ListItem key={option.id} secondaryAction={
                  option.id === editingOptionId ? (
                    <Box>
                      <IconButton onClick={handleSaveEdit}><CheckIcon /></IconButton>
                      <IconButton onClick={() => { setEditingOptionId(null); setEditingOptionName(''); }}><CloseIcon /></IconButton>
                    </Box>
                  ) : (
                    <Box>
                      <IconButton onClick={() => handleEditOption(option)}><EditIcon /></IconButton>
                      {!option.isNew && <IconButton onClick={() => handleDeleteExistingOption(option.id)}><DeleteIcon /></IconButton>}
                    </Box>
                  )
                }>
                  {option.id === editingOptionId ? (
                    <TextField fullWidth value={editingOptionName} onChange={(e) => setEditingOptionName(e.target.value)} onKeyDown={handleEditKeyPress} />
                  ) : (
                    <ListItemText primary={`${index + 1}. ${option.name}`} secondary={option.isActive ? 'Active' : 'Inactive'} />
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {loading && <RingLoader color="#36d7b7" size={24} />}
        <Button onClick={onClose} disabled={loading}>Close</Button>
        <Button onClick={handleFinalSubmit} variant="contained" color="primary" disabled={loading}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnOptionEditorDialog;