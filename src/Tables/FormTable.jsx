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
  TablePagination,
  useMediaQuery,
  useTheme,
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

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

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

  const handleSaveColumnSubmit = (event) => {
    event.preventDefault();
    handleSaveColumn();
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  const paginatedColumns = columns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 4 },
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Typography
          variant={{ xs: 'h5', sm: 'h4' }}
          sx={{ 
            fontWeight: 'bold', 
            color: 'primary.main', 
            mb: { xs: 2, sm: 0 },
            textAlign: { xs: 'center', sm: 'left' },
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          All Columns
        </Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={1}
          width={{ xs: '100%', sm: 'auto' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddColumn}
            size={isSmallScreen ? "small" : "medium"}
            fullWidth={isSmallScreen}
          >
            Add Column
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate('/masterpage')}
            size={isSmallScreen ? "small" : "medium"}
            fullWidth={isSmallScreen}
          >
            FormName
          </Button>
        </Stack>
      </Box>

      {/* Table Section */}
      <TableContainer 
        component={Paper} 
        elevation={2} 
        sx={{ 
          borderRadius: 2,
          maxWidth: '100%',
          overflowX: 'auto'
        }}
      >
        <Table 
          sx={{ 
            minWidth: isSmallScreen ? '650px' : 'auto',
            tableLayout: isSmallScreen ? 'auto' : 'fixed'
          }}
          size={isSmallScreen ? "small" : "medium"}
        >
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 700, 
                  color: 'white',
                  width: { xs: '60px', sm: '80px', md: '100px' },
                  textAlign: 'center',
                  px: { xs: 1, sm: 2 },
                  py: { xs: 1.5, sm: 2 }
                }}
              >
                S.No
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 700, 
                  color: 'white',
                  width: { xs: '150px', sm: '200px', md: '250px' },
                  px: { xs: 1, sm: 2 },
                  py: { xs: 1.5, sm: 2 }
                }}
              >
                Column Name
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 700, 
                  color: 'white',
                  width: { xs: '120px', sm: '150px', md: '200px' },
                  px: { xs: 1, sm: 2 },
                  py: { xs: 1.5, sm: 2 }
                }}
              >
                Data Type
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 700, 
                  color: 'white',
                  width: { xs: '100px', sm: '120px', md: '150px' },
                  px: { xs: 1, sm: 2 },
                  py: { xs: 1.5, sm: 2 }
                }}
              >
                Status
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 700, 
                  color: 'white',
                  width: { xs: '120px', sm: '150px', md: '180px' },
                  textAlign: 'center',
                  px: { xs: 1, sm: 2 },
                  py: { xs: 1.5, sm: 2 }
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedColumns.length > 0 ? (
              paginatedColumns.map((col, idx) => (
                <TableRow 
                  key={col.ColumnId || idx} 
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell 
                    sx={{ 
                      textAlign: 'center',
                      px: { xs: 1, sm: 2 },
                      py: { xs: 1.5, sm: 2 }
                    }}
                  >
                    {page * rowsPerPage + idx + 1}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      px: { xs: 1, sm: 2 },
                      py: { xs: 1.5, sm: 2 },
                      wordBreak: 'break-word'
                    }}
                  >
                    <Typography 
                      fontWeight="medium" 
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      {col.ColumnName}
                    </Typography>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      px: { xs: 1, sm: 2 },
                      py: { xs: 1.5, sm: 2 }
                    }}
                  >
                    <Chip
                      label={col.DataType}
                      size={isSmallScreen ? "small" : "medium"}
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        minWidth: '70px'
                      }}
                    />
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      px: { xs: 1, sm: 2 },
                      py: { xs: 1.5, sm: 2 }
                    }}
                  >
                    <Chip
                      label={col.IsActive ? 'Active' : 'Inactive'}
                      size={isSmallScreen ? "small" : "medium"}
                      color={col.IsActive ? 'success' : 'error'}
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        minWidth: '70px'
                      }}
                    />
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      textAlign: 'center',
                      px: { xs: 1, sm: 2 },
                      py: { xs: 1.5, sm: 2 }
                    }}
                  >
                    <Stack 
                      direction="row" 
                      spacing={1} 
                      justifyContent="center"
                      flexWrap="wrap"
                    >
                      <IconButton
                        size={isSmallScreen ? "small" : "medium"}
                        onClick={() => handleEditColumn(col)}
                        color="primary"
                        sx={{ 
                          '& .MuiSvgIcon-root': {
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size={isSmallScreen ? "small" : "medium"}
                        onClick={() => handleDeleteColumn(col.ColumnId)}
                        color="error"
                        sx={{ 
                          '& .MuiSvgIcon-root': {
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={5} 
                  align="center" 
                  sx={{ 
                    py: 4,
                    px: { xs: 1, sm: 2 }
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    No columns found.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddColumn}
                    sx={{ mt: 1 }}
                    size={isSmallScreen ? "small" : "medium"}
                  >
                    Add your first column
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={columns.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}
        />
      </TableContainer>

      {/* Add/Edit Column Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isSmallScreen}
      >
        <DialogTitle sx={{ 
          pb: 1,
          pr: 6
        }}>
          {editingColumn ? 'Edit Column' : 'Add New Column'}
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
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
        <DialogContent>
          <Box 
            component="form" 
            id="save-column-form" 
            onSubmit={handleSaveColumnSubmit} 
            sx={{ pt: 1 }}
          >
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
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
              size={isSmallScreen ? "small" : "medium"}
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
              size={isSmallScreen ? "small" : "medium"}
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
              <MenuItem value="textarea">Textarea</MenuItem>
              <MenuItem value="h1">Heading 1</MenuItem>
              <MenuItem value="h2">Heading 2</MenuItem>
              <MenuItem value="h3">Heading 3</MenuItem>
              <MenuItem value="h4">Heading 4</MenuItem>
              <MenuItem value="h5">Heading 5</MenuItem>
              <MenuItem value="h6">Heading 6</MenuItem>
              <MenuItem value="p">Paragraph</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          pb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1
        }}>
          <Button 
            onClick={() => setDialogOpen(false)} 
            variant="outlined"
            fullWidth={isSmallScreen}
            size={isSmallScreen ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="save-column-form"
            variant="contained"
            disabled={saving || !newColumn.ColumnName}
            fullWidth={isSmallScreen}
            size={isSmallScreen ? "small" : "medium"}
          >
            {saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : editingColumn ? (
              'Update'
            ) : (
              'Create'
            )}
            {' '}Column
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isSmallScreen}
      >
        <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Are you sure you want to delete this column?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          pb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1
        }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            variant="outlined"
            fullWidth={isSmallScreen}
            size={isSmallScreen ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteColumn}
            variant="contained"
            color="error"
            fullWidth={isSmallScreen}
            size={isSmallScreen ? "small" : "medium"}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars for notifications */}
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