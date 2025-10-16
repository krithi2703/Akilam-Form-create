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
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { BarChart, LineChart, PieChart } from '@mui/x-charts';
import {
  People as PeopleIcon,
  Description as DescriptionIcon,
  ViewColumn as ViewColumnIcon,
  Send as SendIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Payment as PaymentIcon,
  BarChart as BarChartIcon,
  Analytics as AnalyticsIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import axios from '../axiosConfig';

// ------------------- Enhanced Stat Card -------------------
const StatCard = ({ title, value, icon, color, description, trend, loading }) => {
  const theme = useTheme();
  
  return (
    <Card
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.05)} 100%)`,
        borderRadius: 4,
        height: '100%',
        border: `1px solid ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.2)}`,
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 20px 40px ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.2)}`,
          border: `1px solid ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.4)}`,
        },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />
      
      <CardContent sx={{ flexGrow: 1, position: 'relative', zIndex: 1, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography 
              color="textSecondary" 
              variant="caption" 
              fontWeight="600" 
              sx={{ 
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.8
              }}
            >
              {title}
            </Typography>
            {loading ? (
              <Box display="flex" alignItems="center" gap={2} mt={1}>
                <CircularProgress size={24} thickness={4} />
                <Typography variant="h5" component="div" fontWeight="bold">
                  Loading...
                </Typography>
              </Box>
            ) : (
              <Typography variant="h3" component="div" fontWeight="800" sx={{ mt: 1 }}>
                {value?.toLocaleString()}
              </Typography>
            )}
            
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, opacity: 0.8 }}>
                {description}
              </Typography>
            )}
            
            {trend && (
              <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
                <Chip
                  icon={trend.value > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  label={`${trend.value > 0 ? '+' : ''}${trend.value}%`}
                  size="small"
                  color={trend.value > 0 ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ fontWeight: '600' }}
                />
                <Typography variant="caption" color="text.secondary">
                  {trend.label}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.15), 
              color: theme.palette[color]?.main || theme.palette.primary.main,
              width: 60,
              height: 60,
              boxShadow: `0 8px 24px ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.3)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1) rotate(5deg)',
              }
            }}
          >
            {icon}
          </Avatar>
        </Box>
        
        {/* Progress Bar for visual appeal */}
        {!loading && (
          <LinearProgress 
            variant="determinate" 
            value={75}
            sx={{
              mt: 2,
              height: 4,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.2),
              '& .MuiLinearProgress-bar': {
                backgroundColor: theme.palette[color]?.main || theme.palette.primary.main,
                borderRadius: 2,
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

// ------------------- Enhanced Chart Card -------------------
const ChartCard = ({ children, title, subtitle, icon, loading, action }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        overflow: 'visible',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)',
        },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Enhanced Card Header */}
        <Box
          sx={{
            p: 3.5,
            pb: 2.5,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Header Background Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
            }}
          />
          
          <Box display="flex" alignItems="center" justifyContent="space-between" position="relative">
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Typography variant="h5" fontWeight="800" color="primary">
                  {title}
                </Typography>
                {action && (
                  <Chip 
                    label={action} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ fontWeight: '600' }}
                  />
                )}
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ opacity: 0.8 }}>
                {subtitle}
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                color: theme.palette.primary.main,
                width: 56,
                height: 56,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                }
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </Box>
        
        {/* Card Content - Fixed for proper chart display */}
        <Box sx={{ 
          p: 3, 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0, // Important for flexbox children
        }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100%', flex: 1 }}>
              <Box textAlign="center">
                <CircularProgress size={40} thickness={4} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading chart data...
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: 0,
            }}>
              {children}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// ------------------- Enhanced Payment Details Table -------------------
const PaymentDetailsTable = () => {
  const theme = useTheme();
  const [submissions, setSubmissions] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/submissions');
        
        const responseData = response.data;
        let submissionsData = [];
        
        if (Array.isArray(responseData)) {
          submissionsData = responseData;
        } else if (responseData && Array.isArray(responseData.data)) {
          submissionsData = responseData.data;
        } else if (responseData && responseData.submissions) {
          submissionsData = responseData.submissions;
        }
        
        setSubmissions(submissionsData);
        setError(null);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setError('Failed to load payment data. Please try again later.');
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleEmailChange = (event) => {
    setSelectedEmail(event.target.value);
  };

  const uniqueUsers = Array.isArray(submissions) ? submissions.reduce((acc, current) => {
    if (current && current.Emailormobileno && !acc.find(item => item.Emailormobileno === current.Emailormobileno)) {
      acc.push({
        Emailormobileno: current.Emailormobileno,
        UserName: current.UserName || current.Emailormobileno?.split('@')[0] || 'Unknown User'
      });
    }
    return acc;
  }, []) : [];

  const filteredSubmissions = selectedEmail 
    ? submissions.filter(s => s && s.Emailormobileno === selectedEmail)
    : [];

  const totalAmount = filteredSubmissions.reduce((sum, item) => sum + (parseFloat(item.Amount) || 0), 0);

  return (
    <ChartCard
      title="Payment Analytics"
      subtitle="Detailed payment history and transaction insights"
      icon={<ReceiptIcon />}
      loading={loading}
      action={selectedEmail ? `${filteredSubmissions.length} transactions` : ''}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select User</InputLabel>
          <Select
            value={selectedEmail}
            label="Select User"
            onChange={handleEmailChange}
            disabled={loading || uniqueUsers.length === 0}
            sx={{
              borderRadius: 3,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.primary.main, 0.3),
              }
            }}
          >
            {uniqueUsers.map((user) => (
              <MenuItem key={user.Emailormobileno} value={user.Emailormobileno}>
                <Box>
                  <Typography variant="body1" fontWeight="600">
                    {user.UserName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.Emailormobileno}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedEmail && filteredSubmissions.length > 0 && (
        <Box sx={{ mb: 3, p: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="800" color="primary">
                  {filteredSubmissions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Transactions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="800" color="success.main">
                  ₹{totalAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="800" color="info.main">
                  {Math.round(totalAmount / filteredSubmissions.length) || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg. Transaction
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {selectedEmail ? (
        <Box sx={{ 
          width: '100%', 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0,
        }}>
          {filteredSubmissions.length > 0 ? (
            <TableContainer 
              sx={{ 
                flex: 1,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                '& .MuiTableRow-root:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                }
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: '800', bgcolor: 'background.default', fontSize: '0.875rem' }}>
                      SUBMISSION ID
                    </TableCell>
                    <TableCell sx={{ fontWeight: '800', bgcolor: 'background.default', fontSize: '0.875rem' }}>
                      PAYMENT ID
                    </TableCell>
                    <TableCell sx={{ fontWeight: '800', bgcolor: 'background.default', fontSize: '0.875rem' }}>
                      AMOUNT
                    </TableCell>
                    <TableCell sx={{ fontWeight: '800', bgcolor: 'background.default', fontSize: '0.875rem' }}>
                      STATUS
                    </TableCell>
                    <TableCell sx={{ fontWeight: '800', bgcolor: 'background.default', fontSize: '0.875rem' }}>
                      DATE
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubmissions.map((submission, index) => (
                    <TableRow 
                      key={submission.SubmissionId || index} 
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: '600' }}>
                        {submission.SubmissionId || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {submission.RazorpayPaymentId || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: '700', color: 'success.main' }}>
                        ₹{submission.Amount || '0'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={submission.Status || 'unknown'}
                          color={submission.Status === 'captured' ? 'success' : 'default'}
                          size="small"
                          variant="filled"
                          sx={{ 
                            fontWeight: '600',
                            borderRadius: 2
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">
                          {submission.PaymentDate ? 
                            new Date(submission.PaymentDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'
                          }
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box 
              sx={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                py: 8
              }}
            >
              <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom fontWeight="600">
                No Payment Records
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
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            py: 8
          }}
        >
          <AnalyticsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom fontWeight="600">
            {uniqueUsers.length === 0 ? 'No Users Available' : 'Select a User'}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {uniqueUsers.length === 0 
              ? 'No user data available. Please check your API connection.' 
              : 'Choose a user from the dropdown to view their payment analytics'
            }
          </Typography>
        </Box>
      )}
    </ChartCard>
  );
};

// ------------------- Enhanced Form Submission Chart -------------------
const FormSubmissionChart = () => {
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const countsResponse = await axios.get('/submissions/count-by-form');
        
        const countsData = Array.isArray(countsResponse.data) ? countsResponse.data : 
                          countsResponse.data?.data || countsResponse.data?.counts || [];

        setChartData(countsData);
        setError(null);
      } catch (error) {
        console.error('Error fetching data for chart:', error);
        setError('Failed to load analytics data. The server may be down or an error occurred.');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartSetting = {
    yAxis: [{
      label: 'Submission Count',
    }],
    height: 400,
    margin: { left: 70, right: 30, top: 30, bottom: 80 },
    sx: {
      width: '100%',
      flex: 1,
      [`.MuiBarElement-root`]: {
        fill: `url(#gradient)`,
        rx: 6,
      },
      [`.MuiChartsAxis-tickLabel`]: {
        fontSize: '0.75rem',
        fontWeight: '600',
      },
      [`.MuiChartsAxis-label`]: {
        fontSize: '0.875rem',
        fontWeight: '700',
      },
    },
  };

  return (
    <ChartCard
      title="Form Submission Counts"
      subtitle="Total submissions for each form"
      icon={<AnalyticsIcon />}
      loading={loading}
      action={chartData.length > 0 ? `${chartData.reduce((sum, item) => sum + (item.SubmissionCount || 0), 0)} total submissions` : ''}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}
      
      {chartData.length > 0 ? (
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          minHeight: 0,
        }}>
          <svg style={{ height: 0, position: 'absolute' }}>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={theme.palette.primary.main} />
                <stop offset="100%" stopColor={theme.palette.primary.light} />
              </linearGradient>
            </defs>
          </svg>
          <Box sx={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <BarChart
              dataset={chartData}
              xAxis={[{ 
                scaleType: 'band', 
                dataKey: 'FormId', 
                tickPlacement: 'middle', 
                tickLabelPlacement: 'middle',
                tickLabelStyle: {
                  angle: -45,
                  textAnchor: 'end',
                  fontSize: 12,
                  fontWeight: '600',
                },
                label: 'Form ID'
              }]}
              series={[{ 
                dataKey: 'SubmissionCount', 
                label: 'Submissions',
                color: theme.palette.primary.main
              }]}
              {...chartSetting}
            />
          </Box>
        </Box>
      ) : (
        <Box 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            py: 8
          }}
        >
          <BarChartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom fontWeight="600">
            {loading ? 'Loading...' : 'No Data Available'}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {loading ? 'Fetching chart data...' : 'No submission data available.'}
          </Typography>
        </Box>
      )}
    </ChartCard>
  );
};

// ------------------- Enhanced Dashboard -------------------
export default function Dashboard() {
  const theme = useTheme();
  const [counts, setCounts] = useState({
    formCount: 0,
    columnCount: 0,
    submissionCount: 0,
    userCount: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);
  const [countsError, setCountsError] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setCountsLoading(true);
        const response = await axios.get('/columns/counts');
        
        const responseData = response.data;
        
        if (responseData && typeof responseData === 'object') {
          const countsData = {
            formCount: responseData.formCount || responseData.forms || 0,
            columnCount: responseData.columnCount || responseData.columns || 0,
            submissionCount: responseData.submissionCount || responseData.submissions || 0,
            userCount: responseData.userCount || responseData.users || 0,
          };
          setCounts(countsData);
          setCountsError(null);
        } else {
          throw new Error('Invalid data structure for counts');
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
        setCountsError('Failed to load dashboard statistics');
        setCounts({
          formCount: 'Error',
          columnCount: 'Error',
          submissionCount: 'Error',
          userCount: 'Error',
        });
      } finally {
        setCountsLoading(false);
      }
    };

    if (sessionStorage.getItem('userId')) {
      fetchCounts();
    } else {
      setCountsLoading(false);
    }
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0.8)} 50%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.03)} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />

      {/* Main Content */}
      <Container maxWidth={false} sx={{ pt: 4, pb: 4, pl: 4, pr: 4, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Welcome Section */}
        <Box sx={{ mb: 6 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="h2" fontWeight="900" gutterBottom color="primary" sx={{ letterSpacing: '-0.5px' }}>
                Dashboard Overview
              </Typography>
              <Typography variant="h5" color="textSecondary" sx={{ opacity: 0.8, fontWeight: '400' }}>
                Welcome back! Here's your business performance summary
              </Typography>
            </Box>
            <Chip 
              icon={<TrendingUpIcon />} 
              label="Live Analytics" 
              color="success" 
              variant="filled"
              sx={{ 
                fontWeight: '700',
                fontSize: '0.875rem',
                height: 40,
                px: 2
              }}
            />
          </Box>
          {countsError && (
            <Alert severity="warning" sx={{ mt: 2, maxWidth: 500, borderRadius: 3 }}>
              {countsError}
            </Alert>
          )}
        </Box>

        {/* Enhanced Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Users"
              value={counts.userCount}
              description="Registered platform users"
              icon={<PeopleIcon />}
              color="primary"
              trend={{ value: 12, label: "vs last month" }}
              loading={countsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Forms Created"
              value={counts.formCount}
              description="Total forms deployed"
              icon={<DescriptionIcon />}
              color="secondary"
              trend={{ value: 8, label: "vs last month" }}
              loading={countsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Columns Defined"
              value={counts.columnCount}
              description="Custom form fields"
              icon={<ViewColumnIcon />}
              color="warning"
              trend={{ value: 15, label: "vs last month" }}
              loading={countsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Submissions"
              value={counts.submissionCount}
              description="Total form responses"
              icon={<SendIcon />}
              color="success"
              trend={{ value: 23, label: "vs last month" }}
              loading={countsLoading}
            />
          </Grid>
        </Grid>

        {/* Chart and Payment Details Section */}
        <Grid container spacing={4}>
          {/* Form Submission Chart */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ height: '600px' }}> {/* Fixed height container */}
              <FormSubmissionChart />
            </Box>
          </Grid>
          
          {/* Payment Details Table */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ height: '600px' }}> {/* Fixed height container */}
              <PaymentDetailsTable />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Enhanced Footer */}
      <Box
        component="footer"
        sx={{
          p: 4,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          mt: 6,
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="textSecondary">
            © 2025 Akilam Technology. All rights reserved.
          </Typography>
          <Box display="flex" gap={2}>
            <Chip label="v2.1.0" size="small" variant="outlined" />
            <Chip label="Production" size="small" color="success" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}