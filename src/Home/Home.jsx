import React, { useState, useEffect } from 'react';
import {
  Box,
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
  useMediaQuery,
  Grid,
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
import { RingLoader } from 'react-spinners';

// ------------------- Responsive Stat Card -------------------
const StatCard = ({ title, value, icon, color, description, trend, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Card
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.05)} 100%)`,
        borderRadius: 2,
        height: '100%',
        border: `1px solid ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.2)}`,
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: isMobile ? 'none' : 'translateY(-4px)',
          boxShadow: isMobile ? 'none' : `0 8px 24px ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.15)}`,
        },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1, position: 'relative', zIndex: 1, p: isMobile ? 2 : 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography 
              color="textSecondary" 
              variant={isMobile ? "caption" : "body2"} 
              fontWeight="600" 
              sx={{ 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: 0.8
              }}
            >
              {title}
            </Typography>
            {loading ? (
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <RingLoader color={theme.palette[color]?.main || theme.palette.primary.main} size={isMobile ? 16 : 20} />
                <Typography variant={isMobile ? "h6" : "h5"} component="div" fontWeight="bold">
                  Loading...
                </Typography>
              </Box>
            ) : (
              <Typography variant={isMobile ? "h4" : "h3"} component="div" fontWeight="800" sx={{ mt: 0.5 }}>
                {value?.toLocaleString()}
              </Typography>
            )}
            
            {description && !isMobile && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, opacity: 0.8 }}>
                {description}
              </Typography>
            )}
            
            {trend && !isMobile && (
              <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1.5 }}>
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
              width: isMobile ? 40 : 50,
              height: isMobile ? 40 : 50,
              boxShadow: `0 4px 12px ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.2)}`,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        
        {!loading && !isMobile && (
          <Box sx={{ mt: 1.5, height: 3, borderRadius: 2, backgroundColor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.2)}}>
            <Box sx={{ height: '100%', width: '75%', borderRadius: 2, backgroundColor: theme.palette[color]?.main || theme.palette.primary.main}} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ------------------- Responsive Chart Card -------------------
const ChartCard = ({ children, title, subtitle, icon, loading, action }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        overflow: 'hidden',
        background: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Box
          sx={{
            p: isMobile ? 2 : 3,
            pb: isMobile ? 1.5 : 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight="700">
                  {title}
                </Typography>
                {action && !isMobile && (
                  <Chip 
                    label={action} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ fontWeight: '600' }}
                  />
                )}
              </Box>
              <Typography variant={isMobile ? "caption" : "body2"} color="textSecondary" sx={{ opacity: 0.8 }}>
                {subtitle}
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                width: isMobile ? 40 : 48,
                height: isMobile ? 40 : 48,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </Box>
        
        <Box sx={{ 
          p: isMobile ? 2 : 3, 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0,
        }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100%', flex: 1 }}>
              <Box textAlign="center">
                <RingLoader color={theme.palette.primary.main} size={isMobile ? 30 : 40} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  Loading...
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

// ------------------- Responsive Payment Details Table -------------------
const PaymentDetailsTable = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        setError('Failed to load payment data.');
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
      subtitle="Payment history and transactions"
      icon={<ReceiptIcon />}
      loading={loading}
      action={selectedEmail ? `${filteredSubmissions.length} txns` : ''}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth size={isMobile ? "small" : "medium"}>
          <InputLabel>Select User</InputLabel>
          <Select
            value={selectedEmail}
            label="Select User"
            onChange={handleEmailChange}
            disabled={loading || uniqueUsers.length === 0}
          >
            {uniqueUsers.map((user) => (
              <MenuItem key={user.Emailormobileno} value={user.Emailormobileno}>
                <Box>
                  <Typography variant="body2" fontWeight="600">
                    {user.UserName}
                  </Typography>
                  {!isMobile && (
                    <Typography variant="caption" color="text.secondary">
                      {user.Emailormobileno}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedEmail && filteredSubmissions.length > 0 && (
        <Box sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid xs={4}>
              <Box textAlign="center">
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight="700">
                  {filteredSubmissions.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Transactions
                </Typography>
              </Box>
            </Grid>
            <Grid xs={4}>
              <Box textAlign="center">
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight="700" color="success.main">
                  ₹{totalAmount.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total
                </Typography>
              </Box>
            </Grid>
            <Grid xs={4}>
              <Box textAlign="center">
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight="700" color="info.main">
                  {Math.round(totalAmount / filteredSubmissions.length) || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Average
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
                '& .MuiTableRow-root:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                }
              }}
            >
              <Table stickyHeader size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    {!isMobile && (
                      <TableCell sx={{ fontWeight: '700', fontSize: '0.75rem' }}>
                        SUBMISSION ID
                      </TableCell>
                    )}
                    <TableCell sx={{ fontWeight: '700', fontSize: '0.75rem' }}>
                      {isMobile ? 'PAYMENT' : 'PAYMENT ID'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: '700', fontSize: '0.75rem' }}>
                      AMOUNT
                    </TableCell>
                    {!isMobile && (
                      <TableCell sx={{ fontWeight: '700', fontSize: '0.75rem' }}>
                        STATUS
                      </TableCell>
                    )}
                    <TableCell sx={{ fontWeight: '700', fontSize: '0.75rem' }}>
                      DATE
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubmissions.map((submission, index) => (
                    <TableRow 
                      key={submission.SubmissionId || index} 
                      hover
                    >
                      {!isMobile && (
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '0.75rem' }}>
                          {submission.SubmissionId ? `${submission.SubmissionId.slice(0, 8)}...` : 'N/A'}
                        </TableCell>
                      )}
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {submission.RazorpayPaymentId ? `${submission.RazorpayPaymentId.slice(0, 8)}...` : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: '700', color: 'success.main', fontSize: '0.75rem' }}>
                        ₹{submission.Amount || '0'}
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Chip
                            label={submission.Status || 'unknown'}
                            color={submission.Status === 'captured' ? 'success' : 'default'}
                            size="small"
                            sx={{ 
                              fontWeight: '600',
                              fontSize: '0.7rem'
                            }}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Typography variant="caption" fontWeight="600">
                          {submission.PaymentDate ? 
                            new Date(submission.PaymentDate).toLocaleDateString('en-IN', {
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
                py: 4
              }}
            >
              <ReceiptIcon sx={{ fontSize: isMobile ? 40 : 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
              <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" gutterBottom fontWeight="600">
                No Payment Records
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
            py: 4
          }}
        >
          <AnalyticsIcon sx={{ fontSize: isMobile ? 40 : 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
          <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" gutterBottom fontWeight="600">
            {uniqueUsers.length === 0 ? 'No Users' : 'Select User'}
          </Typography>
        </Box>
      )}
    </ChartCard>
  );
};

// ------------------- Responsive Form Submission Chart -------------------
const FormSubmissionChart = () => {
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const countsResponse = await axios.get('/submissions/count-by-form');
        
        const rawData = Array.isArray(countsResponse.data) ? countsResponse.data : 
                          countsResponse.data?.data || countsResponse.data?.counts || [];
        
        const countsData = rawData.map(item => ({
          ...item,
          SubmissionCount: Number(item.SubmissionCount) || 0,
        }));

        setChartData(countsData);
        setError(null);
      } catch (error) {
        console.error('Error fetching data for chart:', error);
        setError('Failed to load analytics data.');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartSetting = {
    height: isMobile ? 300 : 350,
    margin: { 
      left: isMobile ? 50 : 60, 
      right: 20, 
      top: 20, 
      bottom: isMobile ? 60 : 70 
    },
    sx: {
      // width: '100%',
      [`.MuiBarElement-root`]: {
        fill: theme.palette.primary.main,
      },
      [`.MuiChartsAxis-tickLabel`]: {
        fontSize: isMobile ? '0.7rem' : '0.75rem',
        fontWeight: '600',
      },
    },
  };

  return (
    <ChartCard
      title="Form Submissions"
      subtitle="Submissions per form"
      icon={<AnalyticsIcon />}
      loading={loading}
      action={chartData.length > 0 ? `${chartData.reduce((sum, item) => sum + (item.SubmissionCount || 0), 0)} total` : ''}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
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
          <BarChart
            dataset={chartData}
            xAxis={[{ 
              scaleType: 'band', 
              dataKey: 'FormId', 
              tickLabelStyle: {
                angle: isMobile ? -45 : -45,
                textAnchor: 'end',
                fontSize: isMobile ? 10 : 12,
              },
              label: isMobile ? '' : 'Form ID'
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
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            py: 4
          }}
        >
          <BarChartIcon sx={{ fontSize: isMobile ? 40 : 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
          <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" gutterBottom fontWeight="600">
            {loading ? 'Loading...' : 'No Data'}
          </Typography>
        </Box>
      )}
    </ChartCard>
  );
};

// ------------------- Responsive Dashboard -------------------
export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
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
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.background.default, 1)} 100%)`,
      }}
    >
      <Container maxWidth={false} sx={{ 
        pt: isMobile ? 2 : 3, 
        pb: isMobile ? 2 : 4, 
        px: isMobile ? 2 : 3 
      }}>
        {/* Header Section */}
        <Box sx={{ mb: isMobile ? 3 : 4 }}>
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            fontWeight="700" 
            gutterBottom 
            color="primary"
          >
            Dashboard
          </Typography>
          <Typography 
            variant={isMobile ? "body2" : "h6"} 
            color="textSecondary" 
            sx={{ opacity: 0.8 }}
          >
            Welcome back! Here's your performance summary
          </Typography>
          {countsError && (
            <Alert severity="warning" sx={{ mt: 1, borderRadius: 1 }}>
              {countsError}
            </Alert>
          )}
        </Box>

        {/* Stat Cards */}
        <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: isMobile ? 3 : 4 }}>
          <Grid xs={6} sm={6} md={3}>
            <StatCard
              title="Users"
              value={counts.userCount}
              description="Registered users"
              icon={<PeopleIcon />}
              color="primary"
              trend={{ value: 12, label: "vs last month" }}
              loading={countsLoading}
            />
          </Grid>
          <Grid xs={6} sm={6} md={3}>
            <StatCard
              title="Forms"
              value={counts.formCount}
              description="Total forms"
              icon={<DescriptionIcon />}
              color="secondary"
              trend={{ value: 8, label: "vs last month" }}
              loading={countsLoading}
            />
          </Grid>
          <Grid xs={6} sm={6} md={3}>
            <StatCard
              title="Columns"
              value={counts.columnCount}
              description="Form fields"
              icon={<ViewColumnIcon />}
              color="warning"
              trend={{ value: 15, label: "vs last month" }}
              loading={countsLoading}
            />
          </Grid>
          <Grid xs={6} sm={6} md={3}>
            <StatCard
              title="Submissions"
              value={counts.submissionCount}
              description="Form responses"
              icon={<SendIcon />}
              color="success"
              trend={{ value: 23, label: "vs last month" }}
              loading={countsLoading}
            />
          </Grid>
        </Grid>

        {/* Chart and Payment Details Section */}
        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid xs={12} lg={6}>
            <Box sx={{ height: isMobile ? '400px' : '500px' }}>
              <FormSubmissionChart />
            </Box>
          </Grid>
          
          <Grid xs={12} lg={6}>
            <Box sx={{ height: isMobile ? '400px' : '500px' }}>
              <PaymentDetailsTable />
            </Box>
          </Grid>
        </Grid>

        {/* Footer */}
        <Box
          sx={{
            mt: isMobile ? 3 : 4,
            pt: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="caption" color="textSecondary">
            © 2025 Akilam Technology. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}