import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import api from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

export default function FormTable() {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newColumn, setNewColumn] = useState({
    ColumnName: "",
    DataType: "text",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }
    fetchColumnsData();
  }, []);

  const fetchColumnsData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get('/columns');
      setColumns(response.data);
    } catch (err) {
      console.error("Error fetching columns:", err.response?.data || err.message);
      setError("Failed to load columns. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = () => {
    setEditingColumn(null);
    setNewColumn({
      ColumnName: "",
      DataType: "text",
    });
    setDialogOpen(true);
  };

  const handleEditColumn = (column) => {
    setEditingColumn(column);
    setNewColumn({
      ColumnName: column.ColumnName,
      DataType: column.DataType,
    });
    setDialogOpen(true);
  };

  const handleDeleteColumn = (columnId) => {
    setColumnToDelete(columnId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteColumn = async () => {
    setDeleteDialogOpen(false);
    if (!columnToDelete) return;

    try {
      await api.delete(`/columns/${columnToDelete}`);
      toast.success("Column deleted successfully");
      fetchColumnsData();
    } catch (err) {
      toast.error("Failed to delete column: " + (err.response?.data?.error || err.message));
    }
    setColumnToDelete(null);
  };

  const handleSaveColumn = async () => {
    if (!newColumn.ColumnName.trim()) {
      setError("Column name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingColumn) {
        await api.put(
          `/columns/${editingColumn.ColumnId}`,
          {
            ColumnName: newColumn.ColumnName,
            DataType: newColumn.DataType,
            IsActive: true
          }
        );
        toast.success("Column updated successfully");
      } else {
        await api.post(
          '/columns',
          {
            columns: [{
              ColumnName: newColumn.ColumnName,
              DataType: newColumn.DataType,
            }],
          }
        );
        toast.success("Column created successfully");
      }

      setDialogOpen(false);
      fetchColumnsData();
    } catch (err) {
      console.error("Save column error:", err.response?.data || err.message);
      toast.error(
        `Failed to ${editingColumn ? "update" : "create"} column. ${
          err.response?.data?.error || err.message
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess("");
    setError("");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error && !loading) {
    return (
      <Box sx={{ mt: 4, px: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={fetchColumnsData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexDirection={{ xs: 'column', sm: 'row' }}
      >
        <Typography
          variant={{ xs: 'h5', sm: 'h4' }}
          sx={{ fontWeight: 'bold', color: 'primary.main', mb: { xs: 2, sm: 0 } }}
        >
          All Columns
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddColumn}
          >
            Add Column
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate('/masterpage')}
          >
            FormName
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: 'primary.light' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>
                  S.No
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>
                  Column Name
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>
                  Data Type
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }} hidden>
                  Created By
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {columns.length > 0 ? (
                columns.map((col, idx) => (
                  <TableRow key={col.ColumnId || idx} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
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
                    <TableCell hidden>{col.UserName}</TableCell>
                    <TableCell>
                      <Chip
                        label={col.IsActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={col.IsActive ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditColumn(col)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteColumn(col.ColumnId)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      No columns found.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddColumn}
                      sx={{ mt: 1 }}
                    >
                      Add your first column
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingColumn ? 'Edit Column' : 'Add New Column'}
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              Column Details
            </Typography>
            <TextField
              label="Column Name"
              fullWidth
              value={newColumn.ColumnName}
              onChange={(e) =>
                setNewColumn({ ...newColumn, ColumnName: e.target.value })
              }
              margin="normal"
              required
              placeholder="Enter column name"
            />
            <TextField
              label="Data Type"
              select
              fullWidth
              value={newColumn.DataType}
              onChange={(e) =>
                setNewColumn({ ...newColumn, DataType: e.target.value })
              }
              margin="normal"
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="select">Dropdown</MenuItem>
              <MenuItem value="checkbox">Checkbox</MenuItem>
              <MenuItem value="radio">Radio</MenuItem>
              <MenuItem value="flg">Flag</MenuItem>
              <MenuItem value="file">File</MenuItem>
              <MenuItem value="photo">Photo</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSaveColumn}
            variant="contained"
            disabled={saving || !newColumn.ColumnName}
          >
            {saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : editingColumn ? (
              'Update'
            ) : (
              'Create'
            )}
            {' '
            }
            Column
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this column?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteColumn}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={handleCloseSnackbar}>
          {success}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={handleCloseSnackbar}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}