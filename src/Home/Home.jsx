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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
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

// ------------------- Chart Components -------------------
const BarChart = () => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: 300,
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        borderRadius: 3,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            mr: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <BarChartIcon color="primary" sx={{ fontSize: 20 }} />
        </Box>
        <Typography variant="h6" fontWeight="600">Monthly Revenue</Typography>
      </Box>
      <Box flexGrow={1} display="flex" alignItems="flex-end" justifyContent="space-between" px={1}>
        {[60, 40, 80, 50, 90, 70, 100, 60, 80, 90, 75, 95].map((height, index) => (
          <Box
            key={index}
            sx={{
              height: `${height}%`,
              width: 16,
              borderRadius: 4,
              bgcolor: index === 6 ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.6),
              position: 'relative',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute', 
                top: -20, 
                left: 0, 
                right: 0, 
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'text.secondary'
              }}
            >
              {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Typography variant="body2" color="text.secondary">
          January - December 2023
        </Typography>
        <Chip 
          label="+12.4%" 
          size="small" 
          color="success" 
          variant="outlined"
          icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
        />
      </Box>
    </Paper>
  );
};

const LineChart = () => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: 300,
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        borderRadius: 3,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.secondary.main, 0.1),
            mr: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <LineChartIcon color="secondary" sx={{ fontSize: 20 }} />
        </Box>
        <Typography variant="h6" fontWeight="600">User Growth</Typography>
      </Box>
      <Box flexGrow={1} position="relative">
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80%',
            background: `linear-gradient(to top, ${alpha(theme.palette.secondary.main, 0.2)}, transparent)`,
            clipPath:
              'polygon(0% 100%, 8% 40%, 16% 80%, 24% 30%, 32% 60%, 40% 50%, 48% 70%, 56% 40%, 64% 50%, 72% 30%, 80% 40%, 88% 20%, 96% 30%, 100% 0%, 100% 100%)',
          }}
        />
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Typography variant="body2" color="text.secondary">
          Last 12 months
        </Typography>
        <Chip 
          label="+8.2%" 
          size="small" 
          color="success" 
          variant="outlined"
          icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
        />
      </Box>
    </Paper>
  );
};

const PieChart = () => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: 300,
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        borderRadius: 3,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: alpha('#e64a19', 0.1),
            mr: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <PieChartIcon sx={{ color: '#e64a19', fontSize: 20 }} />
        </Box>
        <Typography variant="h6" fontWeight="600">Traffic Sources</Typography>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="center" flexGrow={1}>
        <Box position="relative" width={150} height={150} mt={2}>
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background:
                'conic-gradient(#3f51b5 0% 30%, #e64a19 30% 60%, #ffa000 60% 80%, #4caf50 80% 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 70,
              height: 70,
              borderRadius: '50%',
              bgcolor: 'background.paper',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}
          />
        </Box>
        <Box ml={3}>
          {[
            { label: 'Direct', value: '30%', color: '#3f51b5' },
            { label: 'Social', value: '30%', color: '#e64a19' },
            { label: 'Referral', value: '20%', color: '#ffa000' },
            { label: 'Organic', value: '20%', color: '#4caf50' }
          ].map((item, index) => (
            <Box key={index} display="flex" alignItems="center" mb={1.5}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: item.color,
                  mr: 1.5
                }}
              />
              <Typography variant="body2" sx={{ minWidth: 60 }}>{item.label}</Typography>
              <Typography variant="body2" fontWeight="600">{item.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

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
const RecentActivity = () => {
  const activities = [
    { user: 'John Doe', action: 'submitted a form', time: '2 min ago' },
    { user: 'Sarah Smith', action: 'created a new column', time: '10 min ago' },
    { user: 'Mike Johnson', action: 'updated profile', time: '24 min ago' },
    { user: 'Emma Wilson', action: 'completed registration', time: '1 hour ago' },
    { user: 'Alex Brown', action: 'exported data', time: '2 hours ago' },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        background: `linear-gradient(135deg, ${alpha(useTheme().palette.background.paper, 0.8)} 0%, ${alpha(useTheme().palette.background.paper, 0.9)} 100%)`,
        borderRadius: 3,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <Typography variant="h6" fontWeight="600" gutterBottom>
        Recent Activity
      </Typography>
      <List>
        {activities.map((activity, index) => (
          <ListItem key={index} divider={index < activities.length - 1}>
            <ListItemAvatar>
              <Avatar sx={{ width: 40, height: 40 }}>
                {activity.user.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body2">
                  <Box component="span" fontWeight="600">{activity.user}</Box> {activity.action}
                </Typography>
              }
              secondary={activity.time}
            />
          </ListItem>
        ))}
      </List>
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Welcome back! Here's what's happening with your business today.
            </Typography>
          </Box>
          <Chip 
            label="Today: Oct 12, 2023" 
            variant="outlined" 
            sx={{ borderRadius: 2, py: 1.5 }}
          />
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

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <BarChart />
          </Grid>
          <Grid item xs={12} md={4}>
            <PieChart />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <LineChart />
          </Grid>
          <Grid item xs={12} md={4}>
            <RecentActivity />
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