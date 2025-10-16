import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Button,
  Typography,
  Stack,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import api from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RingLoader } from "react-spinners";

const renderCellContent = (value) => {
  if (!value) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        Not Provided
      </Typography>
    );
  }
  return value;
};

export default function MasterTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    setError("");
    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        navigate("/");
        return;
      }

      const res = await api.get("/formmaster");

      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch form records");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewVersion = async (formId) => {
    if (!formId) return;
    setLoading(true);
    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        navigate("/");
        return;
      }
      const response = await api.get(
        `/formdetails/next-formno/${formId}`
      );
      const nextFormNo = response.data.nextFormNo;
      navigate("/formdetails", {
        state: { formId: formId, formNo: nextFormNo },
      });
    } catch (err) {
      toast.error("Could not create a new version. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewForm = () => {
    navigate("/masterpage");
  };

  const handleSoftDelete = async (formId) => {
    if (!formId) return;
    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        navigate("/");
        return;
      }
      await api.put(
        `/formmaster/${formId}`,
        {}
      );

      toast.success("Form soft deleted successfully");
      // Refresh list after delete
      fetchForms();
    } catch (err) {
      console.error(err);
      toast.error("Failed to soft delete form");
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 4 },
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Header with title and create button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Typography 
          variant={{ xs: 'h6', sm: 'h5' }} 
          sx={{ 
            mb: { xs: 1, sm: 0 }, 
            fontWeight: 'bold', 
            color: theme.palette.mode === 'dark' ? '#1a237e' : '#1976d2',
            textAlign: { xs: 'center', sm: 'left' },
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Form Master Table
        </Typography>
                <Button
                  variant="contained"
                  onClick={handleCreateNewForm}
                  size={isSmallScreen ? "small" : "medium"}
                  fullWidth={isSmallScreen}
                  sx={{
                    maxWidth: { xs: '100%', sm: '200px' },
                    minWidth: { xs: 'auto', sm: '140px' },
                    backgroundColor: theme.palette.mode === 'dark' ? '#1a237e' : '#1976d2',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? '#0d47a1' : '#1565c0',
                    }
                  }}
                >
                  Create New Form
                </Button>      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <RingLoader color="#36d7b7" size={isSmallScreen ? 24 : 40} />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <TableContainer 
          component={Paper} 
          sx={{ 
            maxWidth: '100%',
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: isSmallScreen ? '600px' : 'auto'
            }
          }}
        >
          <Table
            sx={{
              tableLayout: isSmallScreen ? "auto" : "fixed",
              borderCollapse: "collapse",
              border: "1px solid #ccc",
              width: '100%'
            }}
            size={isSmallScreen ? "small" : "medium"}
          >
            <TableHead sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#1a237e' : '#1976d2' }}>
              <TableRow>
                <TableCell 
                  sx={{ 
                    borderRight: "1px solid #ccc", 
                    color: "#fff",
                    width: isSmallScreen ? "60px" : "80px",
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1, sm: 2 }
                  }}
                >
                  S.No.
                </TableCell>
                <TableCell 
                  sx={{ 
                    borderRight: "1px solid #ccc", 
                    color: "#fff", 
                    textAlign: 'center',
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1, sm: 2 }
                  }}
                >
                  Form Name
                </TableCell>
                <TableCell 
                  sx={{ 
                    borderRight: "1px solid #ccc", 
                    color: "#fff" 
                  }} 
                  hidden
                >
                  User Name
                </TableCell>
                <TableCell 
                  sx={{ 
                    borderRight: "1px solid #ccc", 
                    color: "#fff",  
                    width: isSmallScreen ? "120px" : "200px",
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1, sm: 2 }
                  }}
                >
                  Created Date
                </TableCell>
                <TableCell 
                  sx={{ 
                    borderRight: "1px solid #ccc", 
                    color: "#fff", 
                    width: isSmallScreen ? "120px" : "200px",
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1, sm: 2 }
                  }}
                >
                  End Date
                </TableCell>
                <TableCell 
                  sx={{ 
                    borderRight: "1px solid #ccc", 
                    color: "#fff",
                    textAlign: 'center', 
                    width: isSmallScreen ? '30%' : '25%',
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1, sm: 2 }
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((row, index) => (
                <TableRow key={row.FormId}>
                  <TableCell 
                    sx={{ 
                      borderRight: "1px solid #ccc",
                      px: { xs: 1, sm: 2 },
                      py: { xs: 1, sm: 2 },
                      textAlign:'center'
                    }}
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      borderRight: "1px solid #ccc",
                      px: { xs: 1, sm: 2 },
                      py: { xs: 1, sm: 2 },
                      wordBreak: 'break-word'
                    }}
                  >
                    {renderCellContent(row.FormName)}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      borderRight: "1px solid #ccc" 
                    }} 
                    hidden
                  >
                    {renderCellContent(row.UserName)}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      borderRight: "1px solid #ccc",
                      px: { xs: 1, sm: 2 },
                      py: { xs: 1, sm: 2 }
                    }}
                  >
                    {renderCellContent(row.CreatedDate)}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      borderRight: "1px solid #ccc",
                      px: { xs: 1, sm: 2 },
                      py: { xs: 1, sm: 2 }
                    }}
                  >
                    {renderCellContent(row.Enddate)}
                  </TableCell>
                  <TableCell
                    sx={{
                      px: { xs: 1, sm: 2 },
                      py: { xs: 1, sm: 2 }
                    }}
                  >
                    {row.Active === 0 ? (
                      <Typography 
                        variant="body2" 
                        color="error" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          textAlign: 'center'
                        }}
                      >
                        Registration Ended !!
                      </Typography>
                    ) : (
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: { xs: 'column', sm: 'row' }, 
                          gap: 1, 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          flexWrap: 'wrap'
                        }}
                      >
                        <Button
                          variant="contained"
                          color="info"
                          size={isSmallScreen ? "small" : "medium"}
                          onClick={() => navigate(`/masterpage?editId=${row.FormId}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          size={isSmallScreen ? "small" : "medium"}
                          sx={{ 
                            flexShrink: 0,
                            fontSize: { xs: '0.7rem', sm: '0.875rem' },
                            minWidth: { xs: '80px', sm: 'auto' },
                            px: { xs: 1, sm: 2 }
                          }}
                          onClick={() => handleCreateNewVersion(row.FormId)}
                        >
                          {isSmallScreen ? 'Create' : 'Create Form'}
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          size={isSmallScreen ? "small" : "medium"}
                          sx={{ 
                            flexShrink: 0,
                            fontSize: { xs: '0.7rem', sm: '0.875rem' },
                            minWidth: { xs: '80px', sm: 'auto' },
                            px: { xs: 1, sm: 2 }
                          }}
                          onClick={() => navigate("/create-column-table", { state: { formId: row.FormId, formName: row.FormName } })}
                        >
                          {isSmallScreen ? 'Table' : 'Form Table'}
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No forms found. Click "Create New Form" to add one.
        </Alert>
      )}
    </Box>
  );
}