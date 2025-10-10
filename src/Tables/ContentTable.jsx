import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  useMediaQuery
} from '@mui/material';
import {
  Visibility,
  ContentCopy,
  ExpandMore
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const ContentTable = () => {
  const [content, setContent] = useState({});
  const [open, setOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentFormName, setCurrentFormName] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get('/content-dtl/');
        const filteredContent = Object.entries(response.data).reduce((acc, [formName, data]) => {
          if (data.front.length > 0 && data.back.length > 0) {
            acc[formName] = data;
          }
          return acc;
        }, {});
        setContent(filteredContent);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();
  }, []);

  const handleOptionsClick = (event, formName) => {
    setAnchorEl(event.currentTarget);
    setCurrentFormName(formName);
  };

  const handleOptionsClose = () => {
    setAnchorEl(null);
    setCurrentFormName(null);
  };

  const handleOptionSelect = (option) => {
    if (currentFormName) {
      navigate(`/content-details/${currentFormName}/${option}`);
    }
    handleOptionsClose();
  };

  const handleOpen = (content, title) => {
    setSelectedContent(content);
    setDialogTitle(title);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedContent(null);
    setDialogTitle('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Title */}
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          mb: { xs: 2, sm: 4 },
          textAlign: { xs: 'center', sm: 'left' }
        }}
      >
        Content Management
      </Typography>

      {/* Table Container */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflowX: 'auto',
          width: '100%'
        }}
      >
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Form Name
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Front Content
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Back Content
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Object.entries(content).map(([formName, data]) => (
              <TableRow
                key={formName}
                sx={{
                  '&:hover': { backgroundColor: 'action.hover', transition: 'background-color 0.2s ease' },
                  '&:nth-of-type(odd)': { backgroundColor: 'background.default' }
                }}
              >
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem', color: 'text.primary' }}>
                  {formName}
                </TableCell>

                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpen(data.front, `Front Content - ${formName}`)}
                    startIcon={<Visibility />}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      fontSize: { xs: '0.7rem', sm: '0.9rem' },
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    View ({data.front.length})
                  </Button>
                </TableCell>

                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpen(data.back, `Back Content - ${formName}`)}
                    startIcon={<Visibility />}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      borderColor: 'secondary.main',
                      color: 'secondary.main',
                      fontSize: { xs: '0.7rem', sm: '0.9rem' },
                      '&:hover': {
                        backgroundColor: 'secondary.main',
                        color: 'white',
                        borderColor: 'secondary.main'
                      }
                    }}
                  >
                    View ({data.back.length})
                  </Button>
                </TableCell>

                <TableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 1,
                      alignItems: { xs: 'stretch', sm: 'center' }
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => handleOptionsClick(e, formName)}
                      startIcon={<ExpandMore />}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: { xs: 1, sm: 3 },
                        fontSize: { xs: '0.75rem', sm: '0.9rem' },
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Options
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menu for Options - Fixed positioning */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isMobile ? 'center' : 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: isMobile ? 'center' : 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 120,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              fontSize: '0.9rem',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white'
              }
            }
          }
        }}
        MenuListProps={{
          sx: {
            py: 0
          }
        }}
      >
        <MenuItem onClick={() => handleOptionSelect('front')}>Front</MenuItem>
        <MenuItem onClick={() => handleOptionSelect('back')}>Back</MenuItem>
      </Menu>

      {/* Dialog for Content View */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            maxHeight: '90vh',
            m: { xs: 2, sm: 3 }
          }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            fontWeight: 600,
            py: 2,
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          {dialogTitle}
        </DialogTitle>

        <DialogContent dividers sx={{ py: 2, maxHeight: '65vh' }}>
          {selectedContent && selectedContent.length > 0 ? (
            selectedContent.map((item, index) => (
              <Box
                key={item.ContentId || index}
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.default'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: 'primary.main'
                    }}
                  >
                    {item.ContentHeader}
                  </Typography>
                  <Tooltip title="Copy Content">
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(item.ContentLines)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    lineHeight: 1.6,
                    color: 'text.primary',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {item.ContentLines}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                py: 4
              }}
            >
              No content available
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentTable;