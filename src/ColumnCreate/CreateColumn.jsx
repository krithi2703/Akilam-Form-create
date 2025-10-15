import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Checkbox,
  ListItemText,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../axiosConfig";
import { toast } from "react-toastify";

const dataTypes = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
  { value: "flg", label: "Flag" },
  { value: "file", label: "File" },
  { value: "photo", label: "Photo" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "h4", label: "Heading 4" },
  { value: "h5", label: "Heading 5" },
  { value: "h6", label: "Heading 6" },
  { value: "p", label: "Paragraph" },
];

export default function CreateColumn() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [column, setColumn] = useState({ name: "", type: "text" });
  const [gridColumns, setGridColumns] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [columnNameError, setColumnNameError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState(null);

  const [isDefaultColumnsDialogOpen, setIsDefaultColumnsDialogOpen] = useState(false);
  const [allDbColumns, setAllDbColumns] = useState([]);
  const [selectedDefaultColumns, setSelectedDefaultColumns] = useState([]);
  const [fetchingAllColumns, setFetchingAllColumns] = useState(true);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Dark mode styles
  const cardStyle = {
    width: "100%",
    p: 3,
    boxShadow: isDarkMode 
      ? "0 8px 32px rgba(0,0,0,0.4)" 
      : "0 8px 32px rgba(0,0,0,0.1)",
    borderRadius: 4,
    backdropFilter: "blur(10px)",
    backgroundColor: isDarkMode 
      ? theme.palette.background.paper 
      : theme.palette.background.paper,
    border: isDarkMode 
      ? `1px solid ${theme.palette.divider}` 
      : 'none',
  };

  const tableContainerStyle = {
    borderRadius: 3,
    border: isDarkMode 
      ? `1px solid ${theme.palette.divider}` 
      : "1px solid rgba(0,0,0,0.1)",
    maxHeight: 500,
    backgroundColor: isDarkMode 
      ? theme.palette.background.paper 
      : theme.palette.background.paper,
    "&::-webkit-scrollbar": {
      width: 10,
    },
    "&::-webkit-scrollbar-track": {
      background: isDarkMode ? "#424242" : "#f1f1f1",
      borderRadius: 4,
    },
    "&::-webkit-scrollbar-thumb": {
      background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
      borderRadius: 4,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "linear-gradient(45deg, #1976D2 30%, #00B0FF 90%)",
    }
  };

  const tableRowHoverStyle = {
    "&:hover": {
      backgroundColor: isDarkMode 
        ? theme.palette.action.hover 
        : "#e3f2fd",
      transform: "scale(1.002)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      transition: "all 0.2s ease",
    },
    transition: "all 0.2s ease",
  };

  const listItemStyle = {
    borderRadius: 2,
    mb: 1,
    py: 2,
    border: isDarkMode 
      ? `1px solid ${theme.palette.divider}` 
      : "1px solid rgba(0,0,0,0.1)",
    "&:hover": {
      backgroundColor: isDarkMode 
        ? theme.palette.action.hover 
        : "rgba(33, 150, 243, 0.08)",
      transform: "translateX(4px)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    transition: "all 0.2s ease",
  };

  useEffect(() => {
    const fetchAllColumns = async () => {
      try {
        setFetchingAllColumns(true);
        const response = await api.get('/columns/default');
        setAllDbColumns(response.data);
      } catch (err) {
        console.error("Error fetching all columns:", err);
        toast.error("Failed to fetch existing columns.");
      } finally {
        setFetchingAllColumns(false);
      }
    };
    fetchAllColumns();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setColumn((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRow = () => {
    if (!column.name.trim()) {
      setErrorMsg("Column name cannot be empty");
      return;
    }
    setGridColumns((prev) => [...prev, { ...column, id: Date.now(), isDefault: false }]);
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

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (editingColumnId) {
        handleUpdateRow();
      } else {
        handleAddRow();
      }
    }
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

  const getDataTypeColor = (type) => {
    const colorMap = {
      text: "primary",
      number: "secondary",
      date: "success",
      textarea: "info",
      select: "warning",
      checkbox: "error",
      radio: "primary",
      flg: "secondary",
      file: "info",
      photo: "success",
      h1: "error",
      h2: "warning",
      h3: "info",
      h4: "success",
      h5: "primary",
      h6: "secondary",
      p: "default",
    };
    return colorMap[type] || "default";
  };

  const getHeaderLevelColor = (type) => {
    const colorMap = {
      h1: "#f44336",
      h2: "#ff9800",
      h3: "#2196f3",
      h4: "#4caf50",
      h5: "#9c27b0",
      h6: "#607d8b",
      p: "#757575",
    };
    return colorMap[type] || "#1976d2";
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 2 }}>
      <Grid container spacing={3} direction={isMobile ? "column" : "row"}>
        {/* Left Side Form */}
        <Grid item xs={12} md={3} lg={3}>
          <Card sx={cardStyle}>
            <CardContent>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: "2px solid",
                borderColor: "primary.main",
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}>
                <Typography variant="h5" sx={{
                  fontWeight: 700,
                  fontSize: "1.4rem",
                }}>
                  Create New Columns
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsDefaultColumnsDialogOpen(true)}
                  sx={{
                    backgroundColor: isDarkMode ? '#1a237e' : '#1976d2',
                    boxShadow: isDarkMode ? '0 3px 10px rgba(26, 35, 126, 0.4)' : '0 3px 10px rgba(25, 118, 210, 0.4)',
                    borderRadius: 3,
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "0.9rem",
                    px: 2,
                    "&:hover": {
                      backgroundColor: isDarkMode ? '#0d47a1' : '#1565c0',
                      boxShadow: isDarkMode ? '0 5px 15px rgba(26, 35, 126, 0.6)' : '0 5px 15px rgba(25, 118, 210, 0.6)',
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Default Columns
                </Button>
              </Box>

              {errorMsg && (
                <Alert severity="error" sx={{
                  mb: 2,
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(244,67,54,0.2)",
                  border: "1px solid rgba(244,67,54,0.2)",
                  fontWeight: 500,
                }}>
                  {errorMsg}
                </Alert>
              )}
              {successMsg && (
                <Alert severity="success" sx={{
                  mb: 2,
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(76,175,80,0.2)",
                  border: "1px solid rgba(76,175,80,0.2)",
                  fontWeight: 500,
                }}>
                  {successMsg}
                </Alert>
              )}

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Column Name"
                    name="name"
                    value={column.name}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                          borderWidth: 2,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                          borderWidth: 2,
                          boxShadow: "0 0 0 2px rgba(33, 150, 243, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        fontWeight: 500,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Data Type"
                    name="type"
                    value={column.type}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                          borderWidth: 2,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                          borderWidth: 2,
                          boxShadow: "0 0 0 2px rgba(33, 150, 243, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        fontWeight: 500,
                      },
                    }}
                  >
                    {dataTypes.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        sx={{
                          py: 1.5,
                          borderLeft: `4px solid ${getHeaderLevelColor(option.value)}`,
                          margin: "4px 8px",
                          borderRadius: 1,
                          "&:hover": {
                            backgroundColor: isDarkMode 
                              ? theme.palette.action.hover 
                              : "rgba(33, 150, 243, 0.08)",
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Chip
                            label={option.label}
                            size="small"
                            sx={{
                              backgroundColor: getHeaderLevelColor(option.value),
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              mr: 2,
                              minWidth: 80,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {option.value}
                          </Typography>
                        </Box>
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
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 700,
                        textTransform: "none",
                        fontSize: "1rem",
                        backgroundColor: isDarkMode ? '#1a237e' : '#1976d2',
                        boxShadow: isDarkMode ? '0 4px 15px rgba(26, 35, 126, 0.4)' : '0 4px 15px rgba(25, 118, 210, 0.4)',
                        "&:hover": {
                          backgroundColor: isDarkMode ? '#0d47a1' : '#1565c0',
                          boxShadow: isDarkMode ? '0 6px 20px rgba(26, 35, 126, 0.6)' : '0 6px 20px rgba(25, 118, 210, 0.6)',
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Update Column
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={handleAddRow}
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 700,
                        textTransform: "none",
                        fontSize: "1rem",
                        backgroundColor: isDarkMode ? '#1a237e' : '#1976d2',
                        boxShadow: isDarkMode ? '0 4px 15px rgba(26, 35, 126, 0.4)' : '0 4px 15px rgba(25, 118, 210, 0.4)',
                        "&:hover": {
                          backgroundColor: isDarkMode ? '#0d47a1' : '#1565c0',
                          boxShadow: isDarkMode ? '0 6px 20px rgba(26, 35, 126, 0.6)' : '0 6px 20px rgba(25, 118, 210, 0.6)',
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Add Column
                    </Button>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side Table */}
        <Grid item xs={12} md={9} lg={9}>
          {gridColumns.length > 0 && (
            <Card sx={cardStyle}>
              <CardContent>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 4,
                  pb: 2,
                  borderBottom: "2px solid",
                  borderColor: "primary.main",
                }}>
                  <Typography variant="h4" sx={{
                    fontWeight: 700,
                    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}>
                    Columns List
                  </Typography>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={`${gridColumns.length} Column${gridColumns.length !== 1 ? 's' : ''} Added`}
                    color="primary"
                    variant="filled"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      py: 2,
                      boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
                    }}
                  />
                </Box>

                <TableContainer
                  component={Paper}
                  elevation={isDarkMode ? 0 : 8}
                  sx={tableContainerStyle}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ height: 60 }}>
                        <TableCell sx={{
                          py: 2,
                          fontWeight: 800,
                          fontSize: "1rem",
                          border: "none",
                          backgroundColor: isDarkMode 
                            ? theme.palette.background.default 
                            : theme.palette.background.paper,
                          color: isDarkMode 
                            ? theme.palette.text.primary 
                            : theme.palette.text.primary,
                        }}>
                          📝 Column Name
                        </TableCell>
                        <TableCell sx={{
                          py: 2,
                          fontWeight: 800,
                          fontSize: "1rem",
                          border: "none",
                          backgroundColor: isDarkMode 
                            ? theme.palette.background.default 
                            : theme.palette.background.paper,
                          color: isDarkMode 
                            ? theme.palette.text.primary 
                            : theme.palette.text.primary,
                        }}>
                          🎯 Data Type
                        </TableCell>
                        <TableCell align="center" sx={{
                          py: 2,
                          fontWeight: 800,
                          fontSize: "1rem",
                          border: "none",
                          backgroundColor: isDarkMode 
                            ? theme.palette.background.default 
                            : theme.palette.background.paper,
                          color: isDarkMode 
                            ? theme.palette.text.primary 
                            : theme.palette.text.primary,
                        }}>
                          ⚡ Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gridColumns.map((col, index) => (
                        <TableRow
                          key={col.id}
                          sx={tableRowHoverStyle}
                        >
                          <TableCell sx={{
                            fontSize: "16px",
                            py: 2,
                            fontWeight: 600,
                            color: "text.primary",
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {col.name}
                              {col.isDefault && (
                                <Chip
                                  label="Default"
                                  size="small"
                                  color="info"
                                  sx={{
                                    ml: 2,
                                    height: 24,
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                  }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{
                            fontSize: "15px",
                            py: 2
                          }}>
                            <Chip
                              label={col.type}
                              color={getDataTypeColor(col.type)}
                              variant="filled"
                              size="medium"
                              sx={{
                                fontWeight: 700,
                                borderRadius: 2,
                                backgroundColor: getHeaderLevelColor(col.type),
                                color: "white",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                fontSize: "0.8rem",
                                minWidth: 80,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <IconButton
                                color="primary"
                                onClick={() => handleEditGrid(col)}
                                size="medium"
                                disabled={col.isDefault}
                                sx={{
                                  backgroundColor: col.isDefault 
                                    ? (isDarkMode ? "grey.600" : "grey.300") 
                                    : "primary.light",
                                  color: "white",
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                                  "&:hover": {
                                    backgroundColor: col.isDefault 
                                      ? (isDarkMode ? "grey.600" : "grey.400") 
                                      : "primary.main",
                                    transform: "scale(1.1)",
                                    boxShadow: "0 4px 12px rgba(33, 150, 243, 0.4)",
                                  },
                                  transition: "all 0.2s ease",
                                  "&.Mui-disabled": {
                                    backgroundColor: isDarkMode ? "grey.600" : "grey.300",
                                    color: isDarkMode ? "grey.400" : "grey.500",
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteGrid(col)}
                                size="medium"
                                sx={{
                                  backgroundColor: "error.light",
                                  color: "white",
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                                  "&:hover": {
                                    backgroundColor: "error.main",
                                    transform: "scale(1.1)",
                                    boxShadow: "0 4px 12px rgba(244, 67, 54, 0.4)",
                                  },
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 4,
                  pt: 3,
                  borderTop: isDarkMode 
                    ? `2px solid ${theme.palette.divider}` 
                    : "2px solid #e0e0e0"
                }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitAll}
                    disabled={loading}
                    size="large"
                    sx={{
                      px: 6,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 700,
                      textTransform: "none",
                      fontSize: "1.1rem",
                      backgroundColor: isDarkMode ? '#1a237e' : '#1976d2',
                      boxShadow: isDarkMode ? '0 4px 20px rgba(26, 35, 126, 0.4)' : '0 4px 20px rgba(25, 118, 210, 0.4)',
                      "&:hover": {
                        backgroundColor: isDarkMode ? '#0d47a1' : '#1565c0',
                        boxShadow: isDarkMode ? '0 6px 25px rgba(26, 35, 126, 0.6)' : '0 6px 25px rgba(25, 118, 210, 0.6)',
                        transform: "translateY(-2px)",
                      },
                      "&:disabled": {
                        background: isDarkMode ? "#555" : "#cccccc",
                        boxShadow: "none",
                        transform: "none",
                      },
                      transition: "all 0.3s ease",
                      minWidth: 200,
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={24} sx={{ mr: 2, color: 'white' }} />
                        Submitting...
                      </Box>
                    ) : (
                      `Submit ${gridColumns.length} Column${gridColumns.length !== 1 ? 's' : ''}`
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Dialog
        open={isDefaultColumnsDialogOpen}
        onClose={() => setIsDefaultColumnsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            overflow: "hidden",
            backgroundColor: isDarkMode 
              ? theme.palette.background.paper 
              : theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          fontSize: "1.4rem",
          py: 3,
          textAlign: "center",
          backgroundColor: isDarkMode 
            ? theme.palette.background.default 
            : theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}>
          Select Default Columns
        </DialogTitle>
        <DialogContent sx={{ 
          mt: 2, 
          maxHeight: 500, 
          p: 3,
          backgroundColor: isDarkMode 
            ? theme.palette.background.paper 
            : theme.palette.background.paper,
        }}>
          {fetchingAllColumns ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <List>
              {allDbColumns.map((col) => (
                <ListItem
                  key={col.ColumnId}
                  dense
                  button="true"
                  onClick={() => {
                    const selectedIndex = selectedDefaultColumns.indexOf(col.ColumnId);
                    let newSelected = [];
                    if (selectedIndex === -1) {
                      newSelected = newSelected.concat(selectedDefaultColumns, col.ColumnId);
                    } else {
                      newSelected = selectedDefaultColumns.filter(id => id !== col.ColumnId);
                    }
                    setSelectedDefaultColumns(newSelected);
                  }}
                  sx={listItemStyle}
                >
                  <Checkbox
                    edge="start"
                    checked={selectedDefaultColumns.indexOf(col.ColumnId) !== -1}
                    tabIndex={-1}
                    disableRipple
                    color="primary"
                    sx={{
                      "&.Mui-checked": {
                        color: "primary.main",
                      },
                    }}
                  />
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={600} color={theme.palette.text.primary}>
                        {col.ColumnName}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Column ID: {col.ColumnId}
                      </Typography>
                    }
                  />
                  <Chip
                    label={col.Type}
                    size="small"
                    variant="filled"
                    sx={{
                      backgroundColor: getHeaderLevelColor(col.Type),
                      color: "white",
                      fontWeight: 600,
                      minWidth: 80,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          gap: 2,
          backgroundColor: isDarkMode 
            ? theme.palette.background.default 
            : theme.palette.background.paper,
        }}>
          <Button
            onClick={() => setIsDefaultColumnsDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 3,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
              px: 4,
              py: 1,
              border: "2px solid",
              borderColor: isDarkMode ? "grey.600" : "grey.400",
              color: isDarkMode ? "grey.300" : "grey.700",
              "&:hover": {
                border: "2px solid",
                borderColor: isDarkMode ? "grey.500" : "grey.600",
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const columnsToAdd = allDbColumns.filter(col => selectedDefaultColumns.includes(col.ColumnId));
              const newGridColumns = columnsToAdd.map(col => ({
                id: `default-${col.ColumnId}-${Date.now()}`,
                name: col.ColumnName,
                type: col.Type,
                isDefault: true,
              }));
              setGridColumns(prev => [...prev, ...newGridColumns]);
              setIsDefaultColumnsDialogOpen(false);
              setSelectedDefaultColumns([]);
              toast.success(`Added ${columnsToAdd.length} default columns`);
            }}
            variant="contained"
            disabled={selectedDefaultColumns.length === 0}
            sx={{
              borderRadius: 3,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "1rem",
              px: 4,
              py: 1,
              backgroundColor: isDarkMode ? '#1a237e' : '#1976d2',
              boxShadow: isDarkMode ? '0 4px 15px rgba(26, 35, 126, 0.4)' : '0 4px 15px rgba(25, 118, 210, 0.4)',
              "&:hover": {
                backgroundColor: isDarkMode ? '#0d47a1' : '#1565c0',
                boxShadow: isDarkMode ? '0 6px 20px rgba(26, 35, 126, 0.6)' : '0 6px 20px rgba(25, 118, 210, 0.6)',
                transform: "translateY(-2px)",
              },
              "&:disabled": {
                background: isDarkMode ? "#555" : "#cccccc",
                boxShadow: "none",
                transform: "none",
              },
              transition: "all 0.3s ease",
            }}
          >
            Add Selected ({selectedDefaultColumns.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}