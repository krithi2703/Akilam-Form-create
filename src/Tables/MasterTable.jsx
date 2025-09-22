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
  CircularProgress,
  Alert,
  Button,
  Typography,
  Stack,
  
} from "@mui/material";
import api from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function MasterTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

      const formattedData = res.data.map((item) => ({
        ...item,
        CreatedDate: item.CreatedDate
          ? new Date(item.CreatedDate).toISOString().split("T")[0]
          : "",
        Enddate: item.Enddate
          ? new Date(item.Enddate).toISOString().split("T")[0]
          : "",
      }));

      setData(formattedData);
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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      mt={4}
      width="100%"
    >
      {/* Header with title and create button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="90%"
        mb={2}
      >
        <Typography variant="h5">Form Master Table</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateNewForm}
        >
          Create New Form
        </Button>
      </Box>

      {loading && <CircularProgress />}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <TableContainer component={Paper} sx={{ width: "90%" }}>
          <Table
            sx={{
              tableLayout: "fixed",
              borderCollapse: "collapse",
              border: "1px solid #ccc",
            }}
          >
            <TableHead sx={{ backgroundColor: "primary.main" }}>
              <TableRow>
                <TableCell sx={{ borderRight: "1px solid #ccc" , color: "#fff" }}>
                  S.No.
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #ccc" , color: "#fff" }} hidden>
                  Form ID
                </TableCell>
                <TableCell
                  sx={{ borderRight: "1px solid #ccc" , color: "#fff" }}
                  hidden
                >
                  Form No ID
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #ccc" , color: "#fff" }}>
                  Form Name
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #ccc" , color: "#fff" }} hidden>
                  User Name
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #ccc" , color: "#fff" }}>
                  Created Date
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #ccc" , color: "#fff" }}>
                  End Date
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #ccc" , color: "#fff" }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((row, index) => (
                <TableRow key={row.FormId}>
                  <TableCell sx={{ borderRight: "1px solid #ccc" }}>
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #ccc" }} hidden>
                    {row.FormId}
                  </TableCell>
                  <TableCell
                    sx={{ borderRight: "1px solid #ccc" }}
                    hidden
                  >
                    {row.FNoId}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #ccc" }}>
                    {row.FormName}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #ccc" }} hidden>
                    {row.UserName}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #ccc" }}>
                    {row.CreatedDate}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #ccc" }}>
                    {row.Enddate}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleCreateNewVersion(row.FormId)}
                      >
                        Create New Form
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => navigate("/create-column-table")}
                      >
                        Column Table
                      </Button>
                    </Stack>
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
