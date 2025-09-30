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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
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
import {
  People as PeopleIcon,
  Description as DescriptionIcon,
  ViewColumn as ViewColumnIcon,
  Send as SendIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  AccountCircle as AccountCircleIcon,
  MoreVert as MoreVertIcon,
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

// ------------------- Recent Activity -------------------
// Recent Activity component removed.

// ------------------- Form Details Table -------------------
const FormDetailsTable = () => {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get('/form-names');
        setForms(response.data);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    };

    fetchForms();
  }, []);

  return (
    <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Forms
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Form ID</TableCell>
              <TableCell>Form Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.formId}>
                <TableCell>{form.formId}</TableCell>
                <TableCell>{form.formName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
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
                <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Select User to View Payment Details
                    </Typography>
                    <FormControl fullWidth>
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
                </Paper>
            </Grid>
            
            <Grid item xs={12}>
                <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedEmail ? (
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                Payment Details for: {selectedEmail}
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                    <TableRow>
                                        <TableCell>Submission ID</TableCell>
                                        <TableCell>Payment ID</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Payment Date</TableCell>
                                    </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    {filteredSubmissions.map((submission) => (
                                        <TableRow key={submission.SubmissionId}>
                                        <TableCell>{submission.SubmissionId}</TableCell>
                                        <TableCell>{submission.RazorpayPaymentId}</TableCell>
                                        <TableCell>{submission.Amount}</TableCell>
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
                        <Typography variant="h6" color="text.secondary">
                            Please select a user to view payment details.
                        </Typography>
                    )}
                </Paper>
            </Grid>
        </Grid>
    </Box>
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Welcome back! Here's what's happening with your business today.
            </Typography>
          </Box>
          {/* <Chip 
            label="Today: Oct 12, 2023" 
            variant="outlined" 
            sx={{ borderRadius: 2, py: 1.5 }}
          /> */}
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

        <Grid container spacing={3}>
          <Grid item xs={12}>
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
