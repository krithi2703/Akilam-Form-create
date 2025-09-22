import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import api from "../axiosConfig";
import { toast } from "react-toastify";

const dataTypes = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "flg", label: "Flag" },
];

export default function CreateColumn() {
  const [column, setColumn] = useState({ name: "", type: "text" });
  const [gridColumns, setGridColumns] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setColumn((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRow = () => {
    if (!column.name.trim()) {
      setErrorMsg("Column name cannot be empty");
      return;
    }
    setGridColumns((prev) => [...prev, { ...column, id: Date.now() }]);
    setColumn({ name: "", type: "text" });
    setErrorMsg("");
  };

  const handleDeleteGrid = (col) => {
    setGridColumns((prev) => prev.filter((c) => c.id !== col.id));
  };

  const handleEditGrid = (col) => {
    setColumn({ name: col.name, type: col.type });
    setEditingColumnId(col.id);
  };

  const handleUpdateRow = () => {
    setGridColumns((prev) =>
      prev.map((c) =>
        c.id === editingColumnId
          ? { ...c, name: column.name, type: column.type }
          : c
      )
    );
    setEditingColumnId(null);
    setColumn({ name: "", type: "text" });
  };

  const handleSubmitAll = async () => {
    if (gridColumns.length === 0) {
      setErrorMsg("Add at least one column before submitting");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const payload = {
        columns: gridColumns.map((c) => ({
          ColumnName: c.name,
          DataType: c.type,
        })),
      };

      await api.post("/columns", payload);

      setSuccessMsg("Columns created successfully!");
      toast.success("Columns created successfully!");
      setTimeout(() => {
        navigate("/formtable");
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 2 }}>
      <Grid container spacing={2}>
        {/* Left Side Form (fixed small card) */}
        <Grid item xs={12} width={"30%"} md={4} lg={3}>
          <Card sx={{ width: "100%", p: 2, boxShadow: 6 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }} gutterBottom>
                Create New Columns
              </Typography>
              {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
              {successMsg && <Alert severity="success">{successMsg}</Alert>}

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Column Name"
                    name="name"
                    value={column.name}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Type"
                    name="type"
                    value={column.type}
                    onChange={handleChange}
                  >
                    {dataTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  {editingColumnId ? (
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateRow}
                    >
                      Update
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={handleAddRow}
                    >
                      Add
                    </Button>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Table below — takes full width */}
        <Grid item xs={12} width={"65%"} md={8} lg={9}>
          {gridColumns.length > 0 && (
            <Card sx={{ width: "100%", p: 2, boxShadow: 6 }}>
              <CardContent>
                <Typography variant="h5" marginBottom={4}>
                  Columns List
                </Typography>
                <TableContainer component={Paper} elevation={6} sx={{ borderRadius: 2 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ height: 40 }}> {/* Reduced header height */}
                        <TableCell sx={{ py: 1 }}>Column Name</TableCell>
                        <TableCell sx={{ py: 1 }}>Type</TableCell>
                        <TableCell align="right" sx={{ py: 1 }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gridColumns.map((col) => (
                        <TableRow key={col.id} sx={{ height: 48 }}> {/* Reduced row height */}
                          <TableCell sx={{ fontSize: "14px", py: 1 }}>{col.name}</TableCell>
                          <TableCell sx={{ fontSize: "14px", py: 1 }}>{col.type}</TableCell>
                          <TableCell align="right" sx={{ py: 1 }}>
                            <IconButton
                              color="primary"
                              onClick={() => handleEditGrid(col)}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteGrid(col)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitAll}
                    disabled={loading}
                    size="small" // Optional: make button smaller
                  >
                    {loading ? "Submitting..." : "Submit Columns"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
