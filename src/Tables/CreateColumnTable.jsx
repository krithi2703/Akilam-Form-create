import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  Chip,
  useTheme
} from "@mui/material";

// import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { toast } from 'react-toastify';

const CreateColumnTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedForm, setSelectedForm] = useState({ id: "", no: "" });
  const [formColumns, setFormColumns] = useState([]);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingColumnId, setDeletingColumnId] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [newSequence, setNewSequence] = useState("");

  const [cannotDeleteDialogOpen, setCannotDeleteDialogOpen] = useState(false);
  const [cannotDeleteDialogMessage, setCannotDeleteDialogMessage] = useState("");

  const dataTypes = [
    { value: "varchar", label: "Text" },
    { value: "int", label: "Number" },
    { value: "date", label: "Date" },
    { value: "datetime", label: "DateTime" },
    { value: "boolean", label: "Boolean" },
    { value: "decimal", label: "Decimal" },
  ];

  const userId = sessionStorage.getItem("userId");
  const userName = sessionStorage.getItem("userName");
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!userId) {
      setError("You must be logged in to view this page.");
      setLoading(false);
      return;
    }
    fetchForms();
  }, [userId]);

  useEffect(() => {
    const { state } = location;
    if (state && state.formId && state.formNo) {
      const { formId, formNo } = state;
      setSelectedForm({ id: formId, no: formNo });
      fetchFormColumns(formId, formNo);
    }
  }, [location.state]);

  // Fetch all forms with their columns
  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/formdetails/show", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Extract unique forms from the response
      const uniqueForms = [];
      const seenForms = new Set();
      
      response.data.forEach(formGroup => {
        formGroup.columns.forEach(column => {
          const formKey = `${formGroup.FormId}-${column.FormNo}`;
          if (!seenForms.has(formKey)) {
            seenForms.add(formKey);
            uniqueForms.push({
              FormId: formGroup.FormId,
              FormName: formGroup.FormName,
              FormNo: column.FormNo
            });
          }
        });
      });
      
      setForms(uniqueForms);
      console.log("Fetched Forms:", uniqueForms);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  };

  const fetchFormColumns = async (formId, formNo) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/formdetails/user/form-columns?formId=${formId}&formNo=${formNo}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormColumns(response.data);
      console.log(`Fetched columns for FormId: ${formId}, FormNo: ${formNo}:`, response.data);
    } catch (err) {
      console.error("Error fetching form columns:", err);
      setError(err.response?.data?.message || "Failed to fetch form columns");
      setFormColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (event) => {
    const selectedValue = event.target.value;
    if (selectedValue) {
      const [formId, formNo] = selectedValue.split('-');
      setSelectedForm({ id: formId, no: formNo });
      fetchFormColumns(formId, formNo);
    } else {
      setSelectedForm({ id: "", no: "" });
      setFormColumns([]);
    }
  };

  const handleEditClick = (column) => {
    setEditingColumn(column);
    setNewSequence(column.SequenceNo);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditingColumn(null);
    setNewSequence("");
  };

  const handleEditConfirm = async () => {
    if (!editingColumn) return;
    try {
      await axios.put(`http://localhost:5000/api/formdetails/sequence/${editingColumn.Id}`, 
        { sequenceNo: newSequence },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Column sequence updated successfully!");
      fetchFormColumns(selectedForm.id, selectedForm.no); // Refresh
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update column sequence.");
    } finally {
      handleEditDialogClose();
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      // First, check if the column is in use
      const response = await axios.get(`http://localhost:5000/api/formdetails/usage/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.InUse) {
        // If in use, show the "cannot delete" dialog
        setCannotDeleteDialogMessage("This column cannot be deleted because it already contains submitted data.");
        setCannotDeleteDialogOpen(true);
      } else {
        // If not in use, proceed with the normal delete confirmation
        setDeletingColumnId(id);
        setDeleteDialogOpen(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to check column usage.");
    }
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeletingColumnId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!deletingColumnId) return;

      await axios.delete(`http://localhost:5000/api/formdetails/${deletingColumnId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh
      if (selectedForm.id && selectedForm.no) {
        fetchFormColumns(selectedForm.id, selectedForm.no);
      }
      fetchForms();
      toast.success("Column deleted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete column");
    } finally {
      handleDeleteDialogClose();
    }
  };

  const handleCreateNewVersion = async () => {
    if (!selectedForm.id) {
      // If no form is selected, navigate to create a brand new form
      navigate("/create-column");
      return;
    }

    try {
      // Fetch the next available FormNo for the selected FormId
      const response = await axios.get(`http://localhost:5000/api/formdetails/next-formno/${selectedForm.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const nextFormNo = response.data.nextFormNo;

      // Navigate to the details page to add columns to this new version
      navigate("/formdetails", { state: { formId: selectedForm.id, formNo: nextFormNo } });
    } catch (err) {
      toast.error("Could not create a new version. Please try again.");
    }
  };

  if (loading && !forms.length) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Form Details
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>

            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate(`/form/preview/${selectedForm.id}?formNo=${selectedForm.no}`)}
              disabled={!selectedForm.id}
            >
              View Form
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => navigate("/view-submissions", { state: { formId: selectedForm.id, formNo: selectedForm.no } })}
              disabled={!selectedForm.id}
            >
              View Submissions
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Form Selection */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Select Form</InputLabel>
            <Select
              value={selectedForm.id ? `${selectedForm.id}-${selectedForm.no}` : ""}
              onChange={handleFormChange}
              label="Select Form"
            >
              {forms.map((form) => (
                <MenuItem key={`${form.FormId}-${form.FormNo}`} value={`${form.FormId}-${form.FormNo}`}>
                  {form.FormName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Selected Form Columns Table */}
      {loading && <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}><CircularProgress /></Box>}
      {!loading && selectedForm.id && (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Columns for {forms.find(f => f.FormId == selectedForm.id && f.FormNo == selectedForm.no)?.FormName} (FormNo: {selectedForm.no})
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "primary.main" }}>
                  <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}>S.No.</TableCell>
                  <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}>Column Name</TableCell>
                  <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}>Data Type</TableCell>
                  <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}>Sequence No</TableCell>
                  <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }} hidden>User Name</TableCell>
                  <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {formColumns.length > 0 ? formColumns.map((col, index) => (
                  <TableRow key={col.Id} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{col.ColumnName}</TableCell>
                    <TableCell><Chip label={col.DataType} size="small" variant="outlined" color="primary" /></TableCell>
                    <TableCell>{col.SequenceNo}</TableCell>
                    <TableCell hidden>{col.UserName}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleEditClick(col)}><EditIcon /></IconButton>
                      {/* <IconButton color="error" onClick={() => handleDeleteClick(col.Id)}><DeleteIcon /></IconButton> */}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="subtitle1" sx={{ p: 3 }}>No columns found for the selected form.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Edit Sequence Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Sequence Number</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Editing sequence for column: <strong>{editingColumn?.ColumnName}</strong>
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Sequence Number"
            type="number"
            fullWidth
            variant="standard"
            value={newSequence}
            onChange={(e) => setNewSequence(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleEditConfirm} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this column?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>No</Button>
          <Button onClick={handleDeleteConfirm} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cannot Delete Info Dialog */}
      <Dialog
        open={cannotDeleteDialogOpen}
        onClose={() => setCannotDeleteDialogOpen(false)}
      >
        <DialogTitle>Deletion Prevented</DialogTitle>
        <DialogContent>
          <Typography>{cannotDeleteDialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCannotDeleteDialogOpen(false)} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateColumnTable;
