import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Fab,
  alpha,
  useTheme,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import {
  People as PeopleIcon,
  Description as DescriptionIcon,
  ViewColumn as ViewColumnIcon,
  Send as SendIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  AccountCircle as AccountCircleIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';
import axios from '../axiosConfig'; // custom axios instance

// ------------------- Stat Card -------------------
const StatCard = ({ title, value, change, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        borderRadius: 3,
        height: '100%',
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 30px ${alpha(theme.palette[color].main, 0.15)}`,
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              {change >= 0 ? (
                <KeyboardArrowUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
              ) : (
                <KeyboardArrowDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
              )}
              <Typography
                variant="body2"
                color={change >= 0 ? 'success.main' : 'error.main'}
                fontWeight="500"
              >
                {change >= 0 ? '+' : ''}
                {change}% from last month
              </Typography>
            </Box>
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: alpha(theme.palette[color].main, 0.1), 
              color: theme.palette[color].main,
              width: 48,
              height: 48
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// ------------------- Payment Details Table -------------------
const PaymentDetailsTable = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get('/submissions/all');
        setSubmissions(response.data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
    };

    fetchSubmissions();
  }, []);

  const handleEmailChange = (event) => {
    setSelectedEmail(event.target.value);
  };

  const uniqueEmails = [...new Set(submissions.map(item => item.Emailormobileno))];
  
  const filteredSubmissions = submissions.filter(s => s.Emailormobileno === selectedEmail);

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
              Payment Details
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
              Select a user to view their payment history and transaction details
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select by Email/Mobile</InputLabel>
              <Select
                value={selectedEmail}
                label="Select by Email/Mobile"
                onChange={handleEmailChange}
              >
                {uniqueEmails.map((email) => (
                  <MenuItem key={email} value={email}>
                    {email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedEmail ? (
              <Box sx={{ width: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Payment Details for: <Chip label={selectedEmail} color="primary" variant="outlined" />
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Submission ID</strong></TableCell>
                        <TableCell><strong>Payment ID</strong></TableCell>
                        <TableCell><strong>Amount</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Payment Date</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSubmissions.map((submission) => (
                        <TableRow key={submission.SubmissionId} hover>
                          <TableCell>{submission.SubmissionId}</TableCell>
                          <TableCell>{submission.RazorpayPaymentId}</TableCell>
                          <TableCell>₹{submission.Amount}</TableCell>
                          <TableCell>
                            <Chip
                              label={submission.Status}
                              color={submission.Status === 'captured' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{new Date(submission.PaymentDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Paper 
                sx={{ 
                  p: 6, 
                  textAlign: 'center', 
                  bgcolor: 'background.default',
                  border: '2px dashed',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No User Selected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please select a user from the dropdown above to view their payment details
                </Typography>
              </Paper>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// ------------------- Form Submission Chart -------------------
const FormSubmissionChart = () => {
  const [chartData, setChartData] = useState([]);
  const [allForms, setAllForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const fetchAllForms = async () => {
      try {
        const response = await axios.get('/form-names');
        console.log('Forms API response:', response.data); // Added console.log
        setAllForms(response.data);
        if (response.data.length > 0) {
          setSelectedFormId(response.data[0].formId); // Select the first form by default
        }
      } catch (error) {
        console.error('Error fetching all forms:', error);
      }
    };
    fetchAllForms();
  }, []);

  useEffect(() => {
    const fetchAndFilterChartData = async () => {
      try {
        const response = await axios.get('/submissions/count-by-form');
        let data = response.data;

        if (selectedFormId) {
          data = data.filter(item => item.FormId === selectedFormId);
        }
        setChartData(data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchAndFilterChartData();
  }, [selectedFormId]);

  const handleFormChange = (event) => {
    setSelectedFormId(event.target.value);
  };

  if (chartData.length === 0 && !selectedFormId) {
    return (
      <Paper sx={{ 
        p: 2, 
        boxShadow: 3, 
        borderRadius: 2, 
        height: 400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography variant="h6" color="text.secondary">
          No submission data available for chart.
        </Typography>
      </Paper>
    );
  }

  const chartSetting = {
    yAxis: [{
      label: 'Submission Count',
    }],
    width: 500,
    height: 350,
    sx: {
      [`.MuiBarElement-root`]: {
        fill: theme.palette.primary.main,
      },
    },
  };

  return (
    <Paper sx={{ 
      p: 3, 
      boxShadow: 3, 
      borderRadius: 2, 
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
        Form Submissions Overview
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
        Distribution of submissions across different forms
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Form</InputLabel>
        <Select
          value={selectedFormId}
          label="Select Form"
          onChange={handleFormChange}
        >
          {allForms.map((form) => (
            <MenuItem key={form.formId} value={form.formId}>
              {form.formName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {chartData.length > 0 ? (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart
            dataset={chartData}
            xAxis={[{ 
              scaleType: 'band', 
              dataKey: 'FormName', 
              tickPlacement: 'middle', 
              tickLabelPlacement: 'middle' 
            }]}
            series={[{ 
              dataKey: 'SubmissionCount', 
              label: 'Submissions',
              color: theme.palette.primary.main
            }]}
            {...chartSetting}
          />
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No submission data for the selected form.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// ------------------- Dashboard -------------------
export default function Dashboard() {
  const theme = useTheme();
  const [counts, setCounts] = useState({
    formCount: '---',
    columnCount: '---',
    submissionCount: '---',
    userCount: '---',
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get('/columns/counts');
        setCounts(response.data);
      } catch (error) {
        console.error('Error fetching counts:', error);
        setCounts({
          formCount: 'Error',
          columnCount: 'Error',
          submissionCount: 'Error',
          userCount: 'Error',
        });
      }
    };

    if (sessionStorage.getItem('userId')) {
      fetchCounts();
    }
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          width: '100%',
          zIndex: 1000,
          top: 0,
        }}
      >
        <Typography variant="h5" fontWeight="700" color="primary">
          CompanyName
        </Typography>
        <Box display="flex" alignItems="center">
          <IconButton sx={{ mr: 1 }}>
            <NotificationsIcon />
          </IconButton>
          <IconButton sx={{ mr: 1 }}>
            <EmailIcon />
          </IconButton>
          <Avatar sx={{ width: 40, height: 40 }}>
            <AccountCircleIcon />
          </Avatar>
        </Box>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {/* Welcome Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Welcome back! Here's what's happening with your business today.
            </Typography>
          </Box>
        </Box>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="USERS"
              value={counts.userCount}
              change={12.4}
              icon={<PeopleIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="FORMS"
              value={counts.formCount}
              change={5.2}
              icon={<DescriptionIcon />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="COLUMNS"
              value={counts.columnCount}
              change={-1.8}
              icon={<ViewColumnIcon />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="SUBMISSIONS"
              value={counts.submissionCount}
              change={20.1}
              icon={<SendIcon />}
              color="success"
            />
          </Grid>
        </Grid>

        {/* Chart and Payment Details Section */}
        <Grid container spacing={3}>
          {/* Form Submission Chart */}
          <Grid item xs={12} lg={6}>
            <FormSubmissionChart />
          </Grid>
          
          {/* Payment Details Table */}
          <Grid item xs={12} lg={6}>
            <PaymentDetailsTable />
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          mt: 3
        }}
      >
        <Typography variant="body2" color="textSecondary" align="center">
          © 2025 Akilam Technology. All rights reserved.
        </Typography>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}