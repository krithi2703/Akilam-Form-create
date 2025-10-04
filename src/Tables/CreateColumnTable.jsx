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
  useTheme,
  TablePagination
} from "@mui/material";

// import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import api from "../axiosConfig";
import { toast } from 'react-toastify';
import { Switch } from "@mui/material"; // New import

const CreateColumnTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedForm, setSelectedForm] = useState({ id: "", no: "" });
  const [formColumns, setFormColumns] = useState([]);
  const [initialFormName, setInitialFormName] = useState(""); // New state for initial form name
  const [bannerImageUrl, setBannerImageUrl] = useState(""); // State for banner image URL
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingColumnId, setDeletingColumnId] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [newSequence, setNewSequence] = useState("");

  const [cannotDeleteDialogOpen, setCannotDeleteDialogOpen] = useState(false);
  const [cannotDeleteDialogMessage, setCannotDeleteDialogMessage] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleIsValidChange = async (formDetailId, currentIsValid) => {
    try {
      await api.put(`/formdetails/update-isvalid/${formDetailId}`, { isValid: !currentIsValid });
      toast.success("Required status updated successfully!");
      // Refresh the columns to reflect the change
      fetchFormColumns(selectedForm.id, selectedForm.no);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update required status.");
    }
  };

  const dataTypes = [
    { value: "varchar", label: "Text" },
    { value: "int", label: "Number" },
    { value: "date", label: "Date" },
    { value: "datetime", label: "DateTime" },
    { value: "boolean", label: "Boolean" },
    { value: "decimal", label: "Decimal" },
  ];

  const userId = sessionStorage.getItem("userId");

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
    //console.log("location.state in CreateColumnTable:", state);

    if (state && state.formId) {
      let { formId, formNo, formName } = state;

      if (!formNo) {
        // If formNo is missing, and forms are not yet loaded, we need to wait.
        // If forms are loaded, try to find formNo.
        if (forms.length > 0) {
          const foundForm = forms.find(f => f.FormId === formId);
          if (foundForm) {
            formNo = foundForm.FormNo;
           // console.log("Found formNo from local state:", formNo);
          }
        } else {
          // Forms not loaded yet, defer processing until forms are available.
          // This useEffect will re-run when 'forms' changes.
          return;
        }
      }

      if (formId && formNo) {
        setSelectedForm({ id: formId, no: formNo });
        setInitialFormName(formName || "");
        fetchFormColumns(formId, formNo);
      } else if (formId && !formNo) {
        setError("Form number (FormNo) is missing for the selected form.");
        setLoading(false);
      }
    }
  }, [location.state, forms]);

  useEffect(() => {
    const formId = selectedForm.id;
     if (formId) {
      // Find the selected form from the 'forms' state to get its FormNo
      const form = forms.find(f => f.FormId === formId);
      if (form) {
        setSelectedForm({ id: form.FormId, no: form.FormNo });
        fetchFormColumns(form.FormId, form.FormNo);
      } 
    }
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fetch all forms with their columns
  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await api.get("/formdetails/show");
      
      // Process forms to get unique FormId with the latest FormNo
      const formsMap = new Map(); // Map to store the latest version of each form by FormId

      response.data.forEach(formGroup => {
        formGroup.columns.forEach(column => {
          const currentForm = {
            FormId: formGroup.FormId,
            FormName: formGroup.FormName,
            FormNo: column.FormNo,
            EndDate: formGroup.EndDate,
          };

          if (!formsMap.has(currentForm.FormId)) {
            formsMap.set(currentForm.FormId, currentForm);
          } else {
            // If a form with this FormId already exists, compare EndDate and keep the latest
            const existingForm = formsMap.get(currentForm.FormId);
            if (new Date(currentForm.EndDate) > new Date(existingForm.EndDate)) {
              formsMap.set(currentForm.FormId, currentForm);
            }
          }
        });
      });
      
      // Convert map values to an array and sort by EndDate in descending order
      const uniqueForms = Array.from(formsMap.values()).sort((a, b) => new Date(b.EndDate) - new Date(a.EndDate));
      
      setForms(uniqueForms);
     // console.log("Fetched and Sorted Unique Forms (latest version by FormId):", uniqueForms);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  };

  const fetchFormColumns = async (formId, formNo) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/formdetails/user/form-columns?formId=${formId}&formNo=${formNo}`
      );
      const sortedColumns = response.data.sort((a, b) => a.SequenceNo - b.SequenceNo);
      setFormColumns(sortedColumns);

      // Set banner image if available in the fetched columns
      if (sortedColumns.length > 0 && sortedColumns[0].BannerImage) {
        setBannerImageUrl(`${api.defaults.baseURL.replace('/api', '')}${sortedColumns[0].BannerImage}`);
      } else {
        setBannerImageUrl("");
      }
      //console.log(`Fetched columns for FormId: ${formId}, FormNo: ${formNo}:`, sortedColumns);
    } catch (err) {
      console.error("Error fetching form columns:", err);
      setError(err.response?.data?.message || "Failed to fetch form columns");
      setFormColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (event) => {
    const formId = event.target.value;
    if (formId) {
      // Find the selected form from the 'forms' state to get its FormNo
      const form = forms.find(f => f.FormId === formId);
      if (form) {
        setSelectedForm({ id: form.FormId, no: form.FormNo });
        fetchFormColumns(form.FormId, form.FormNo);
      } else {
        // Should not happen if forms state is correctly populated
        setSelectedForm({ id: "", no: "" });
        setFormColumns([]);
        setBannerImageUrl("");
      }
    } else {
      setSelectedForm({ id: "", no: "" });
      setFormColumns([]);
      setBannerImageUrl("");
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
      await api.put(`/formdetails/sequence/${editingColumn.Id}`, 
        { sequenceNo: newSequence }
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
      const response = await api.get(`/formdetails/usage/${id}`);

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

      await api.delete(`/formdetails/${deletingColumnId}`);

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
      const response = await api.get(`/formdetails/next-formno/${selectedForm.id}`);
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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Typography variant={{ xs: 'h5', sm: 'h4' }} component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: { xs: 2, sm: 0 } }}>
            Form Details
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/formdetails", { state: { formId: selectedForm.id, formNo: selectedForm.no } })}
              disabled={!selectedForm.id}
            >
              Add Column
            </Button>

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
              onClick={() => navigate(`/form/submissions/${selectedForm.id}`, { state: { formNo: selectedForm.no } })}
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
          {initialFormName ? (
            <TextField
              fullWidth
              label="Selected Form Name"
              value={initialFormName}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          ) : (
            <FormControl fullWidth>
              <InputLabel>{selectedForm.id ? "Selected Form" : "Select Form"}</InputLabel>
              <Select
                value={selectedForm.id || ""}
                onChange={handleFormChange}
                label={selectedForm.id ? "Selected Form" : "Select Form"}
              >
                {forms.map((form) => (
                  <MenuItem key={form.FormId} value={form.FormId}>
                    {form.FormName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
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
            <Box sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "primary.main" }}>
                    <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}>S.No.</TableCell>
                    <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}>Column Name</TableCell>
                    <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}>Data Type</TableCell>
                    <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}>Sequence No</TableCell>
                    <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}>Is Required</TableCell>
                    <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }} hidden>User Name</TableCell>
                    <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {formColumns.length > 0 ? formColumns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((col, index) => {
                    const isSpecialType = ['radio', 'select', 'checkbox'].includes(col.DataType?.toLowerCase());
                    // The switch should appear if it's not a special type.
                    const canShowSwitch = !isSpecialType;

                    return (
                      <TableRow key={col.Id} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{col.ColumnName}</TableCell>
                        <TableCell><Chip label={col.DataType} size="small" variant="outlined" color="primary" /></TableCell>
                        <TableCell>{col.SequenceNo}</TableCell>
                        <TableCell>
                          {canShowSwitch && (
                            <Switch
                              checked={col.IsValid || false} // Ensure it's a boolean
                              onChange={() => handleIsValidChange(col.Id, col.IsValid)}
                              color="primary"
                              inputProps={{ 'aria-label': 'toggle required status' }}
                            />
                          )}
                        </TableCell>
                        <TableCell hidden>{col.UserName}</TableCell>
                        <TableCell align="center">
                          <IconButton color="primary" onClick={() => handleEditClick(col)}><EditIcon /></IconButton>
                          {/* <IconButton color="error" onClick={() => handleDeleteClick(col.Id)}><DeleteIcon /></IconButton> */}
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center"> {/* colSpan increased by 2 for new column and hidden column */}
                        <Typography variant="subtitle1" sx={{ p: 3 }}>No columns found for the selected form.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={formColumns.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
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