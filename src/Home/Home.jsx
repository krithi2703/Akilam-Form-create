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
  Container,
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
  Payment as PaymentIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import axios from '../axiosConfig'; // custom axios instance

// ------------------- Stat Card -------------------
const StatCard = ({ title, value, icon, color, description }) => {
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
        },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {description}
              </Typography>
            )}
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

// ------------------- Chart Card -------------------
const ChartCard = ({ children, title, subtitle, icon }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Card Header */}
        <Box
          sx={{
            p: 3,
            pb: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                width: 50,
                height: 50,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </Box>
        
        {/* Card Content */}
        <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};

// ------------------- Payment Details Table -------------------
const PaymentDetailsTable = () => {
  const theme = useTheme();
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
  
  const filteredSubmissions = selectedEmail 
    ? submissions.filter(s => s.Emailormobileno === selectedEmail)
    : [];

  return (
    <ChartCard
      title="Payment Details"
      subtitle="Select a user to view their payment history and transaction details"
      icon={<PaymentIcon />}
    >
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
        <Box sx={{ width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight="600">
              Payment History
            </Typography>
            <Chip 
              label={selectedEmail} 
              color="primary" 
              variant="outlined" 
              size="small"
            />
          </Box>
          
          <TableContainer 
            sx={{ 
              flexGrow: 1,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              '& .MuiTableRow-root:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              }
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>
                    Submission ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>
                    Payment ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>
                    Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>
                    Payment Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow 
                    key={submission.SubmissionId} 
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {submission.SubmissionId}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {submission.RazorpayPaymentId}
                    </TableCell>
                    <TableCell sx={{ fontWeight: '600' }}>
                      ₹{submission.Amount}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={submission.Status}
                        color={submission.Status === 'captured' ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(submission.PaymentDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredSubmissions.length === 0 && (
            <Box 
              sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                py: 8
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Payment Records Found
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No payment history available for the selected user
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            py: 8
          }}
        >
          <PaymentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No User Selected
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Please select a user from the dropdown above to view their payment details
          </Typography>
        </Box>
      )}
    </ChartCard>
  );
};

// ------------------- Form Submission Chart -------------------
const FormSubmissionChart = () => {
  const [allChartData, setAllChartData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [allForms, setAllForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formsResponse, countsResponse] = await Promise.all([
          axios.get('/public/formname'),
          axios.get('/submissions/count-by-form'),
        ]);

        const forms = formsResponse.data;
        const counts = countsResponse.data;

        setAllForms(forms);
        setAllChartData(counts);

        if (forms.length > 0) {
          setSelectedFormId(String(forms[0].formId));
        }
      } catch (error) {
        console.error('Error fetching data for chart:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedFormId) {
      const filteredData = allChartData.filter(
        (item) => String(item.FormId) === selectedFormId
      );
      setChartData(filteredData);
    } else {
      setChartData([]);
    }
  }, [selectedFormId, allChartData]);

  const handleFormChange = (event) => {
    setSelectedFormId(event.target.value);
  };

  const chartSetting = {
    yAxis: [{
      label: 'Submission Count',
    }],
    height: 350,
    sx: {
      width: '100%',
      [`.MuiBarElement-root`]: {
        fill: theme.palette.primary.main,
        rx: 4, // Rounded corners for bars
      },
      [`.MuiChartsAxis-tickLabel`]: {
        fontSize: '0.75rem',
      },
      [`.MuiChartsAxis-label`]: {
        fontSize: '0.875rem',
      },
    },
  };

  return (
    <ChartCard
      title="Form Submissions Overview"
      subtitle="Distribution of submissions across different forms"
      icon={<BarChartIcon />}
    >
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Form</InputLabel>
        <Select
          value={selectedFormId}
          label="Select Form"
          onChange={handleFormChange}
        >
          {allForms.map((form) => (
            <MenuItem key={form.formId} value={String(form.formId)}>
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
              tickLabelPlacement: 'middle',
              tickLabelStyle: {
                angle: -45,
                textAnchor: 'end',
                fontSize: 12,
              }
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
        <Box 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            py: 8
          }}
        >
          <BarChartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {selectedFormId ? 'No Data Available' : 'Select a Form'}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {selectedFormId 
              ? 'No submission data available for the selected form.' 
              : 'Please select a form from the dropdown to view submission data.'
            }
          </Typography>
        </Box>
      )}
    </ChartCard>
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
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}
      >
        <Typography variant="h5" fontWeight="700" color="primary">
          CompanyName
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton 
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <NotificationsIcon />
          </IconButton>
          <IconButton 
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <EmailIcon />
          </IconButton>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40,
              bgcolor: theme.palette.primary.main,
            }}
          >
            <AccountCircleIcon />
          </Avatar>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 10, pb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom color="primary">
            Dashboard
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
            Welcome back! Here's what's happening with your business today.
          </Typography>
        </Box>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="USERS"
              value={counts.userCount}
              description="Total Registered Users"
              icon={<PeopleIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="FORMS"
              value={counts.formCount}
              description="Total Forms Created"
              icon={<DescriptionIcon />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="COLUMNS"
              value={counts.columnCount}
              description="Total Columns Defined"
              icon={<ViewColumnIcon />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="SUBMISSIONS"
              value={counts.submissionCount}
              description="Total Submissions Received"
              icon={<SendIcon />}
              color="success"
            />
          </Grid>
        </Grid>

        {/* Chart and Payment Details Section */}
        <Grid container spacing={4}>
          {/* Form Submission Chart */}
          <Grid item xs={12} lg={6}>
            <FormSubmissionChart />
          </Grid>
          
          {/* Payment Details Table */}
          <Grid item xs={12} lg={6}>
            <PaymentDetailsTable />
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          mt: 4
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
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}