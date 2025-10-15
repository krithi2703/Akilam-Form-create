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
  useMediaQuery,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Select
} from '@mui/material';
import {
  Visibility,
  ContentCopy,
  ExpandMore,
  Add as AddIcon
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
  const [addContentDialogOpen, setAddContentDialogOpen] = useState(false); // New state for dialog
  const [selectedFormToAddContent, setSelectedFormToAddContent] = useState(''); // New state for selected form
  const [allForms, setAllForms] = useState([]); // New state for all forms
  const [isValidFormFrontForContent, setIsValidFormFrontForContent] = useState(false); // New state for front content switch
  const [isValidFormBackForContent, setIsValidFormBackForContent] = useState(false); // New state for back content switch

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get('/content-dtl/');
        const filteredContent = Object.entries(response.data).reduce((acc, [formName, data]) => {
          if (data.front.length > 0 || data.back.length > 0) {
            acc[formName] = data;
          }
          return acc;
        }, {});
        setContent(filteredContent);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    const fetchForms = async () => {
      try {
        const response = await axios.get('/formmaster'); // Assuming /formmaster returns all forms
        setAllForms(response.data);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    };

    fetchContent();
    fetchForms();
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

  const handleAddContentClick = () => {
    setAddContentDialogOpen(true);
  };

  const handleAddContentDialogClose = () => {
    setAddContentDialogOpen(false);
    setSelectedFormToAddContent('');
    setIsValidFormFrontForContent(false);
    setIsValidFormBackForContent(false);
  };

  const handleAddContentSubmit = () => {
    if (!selectedFormToAddContent) {
      alert('Please select a form.');
      return;
    }
    const form = allForms.find(f => f.FormId === selectedFormToAddContent);
    navigate('/content', {
      state: {
        formId: selectedFormToAddContent,
        formName: form ? form.FormName : '',
        isValidFormFront: isValidFormFrontForContent,
        isValidFormBack: isValidFormBackForContent,
      },
    });
    handleAddContentDialogClose();
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 4 } }}>
              {/* Title */}
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: theme.palette.mode === 'dark' ? '#1a237e' : '#1976d2',
                  textAlign: { xs: 'center', sm: 'left' },
                  mb: 0 // Remove bottom margin from title when in flex container
                }}
              >
                Content Management
              </Typography>
                              <Button
                                variant="contained"
                                onClick={handleAddContentClick}
                                startIcon={<AddIcon />}
                                sx={{
                                  backgroundColor: theme.palette.mode === 'dark' ? '#1a237e' : '#1976d2',
                                  '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' ? '#0d47a1' : '#1565c0',
                                  },
                                  color: 'white',
                                  textTransform: 'none',
                                  borderRadius: 2,
                                  px: { xs: 1.5, sm: 3 },
                                  py: { xs: 0.8, sm: 1.2 },
                                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                                }}
                              >
                                Add Content
                              </Button>            </Box>

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
            <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#1a237e' : '#1976d2' }}>
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
                }}
              >
                <TableCell sx={{ fontWeight: 500, fontSize: '1rem', color: 'text.primary' }}>
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
                      borderColor: theme.palette.mode === 'dark' ? 'white' : '#1976d2',
                      color: theme.palette.mode === 'dark' ? 'white' : '#1976d2',
                      fontSize: { xs: '0.7rem', sm: '0.9rem' },
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? '#1a237e' : '#1976d2',
                        color: 'white',
                        borderColor: theme.palette.mode === 'dark' ? '#1a237e' : '#1976d2'
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
                      onClick={(e) => handleOptionsClick(e, formName)}
                      startIcon={<ExpandMore />}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: { xs: 1, sm: 3 },
                        fontSize: { xs: '0.75rem', sm: '0.9rem' },
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        width: { xs: '100%', sm: 'auto' },
                        backgroundColor: theme.palette.mode === 'dark' ? '#1a237e' : '#1976d2',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? '#0d47a1' : '#1565c0',
                        }
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
              px: 3,
              borderColor: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
              color: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(25, 118, 210, 0.08)',
                borderColor: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Content Dialog */}
      <Dialog
        open={addContentDialogOpen}
        onClose={handleAddContentDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Add Content
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Form</InputLabel>
            <Select
              value={selectedFormToAddContent}
              label="Select Form"
              onChange={(e) => setSelectedFormToAddContent(e.target.value)}
            >
              {Array.isArray(allForms) && allForms.length > 0 ? (
                allForms.map((form) => (
                  <MenuItem key={form.FormId} value={form.FormId}>
                    {form.FormName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">No forms available</MenuItem>
              )}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={isValidFormFrontForContent}
                onChange={(e) => setIsValidFormFrontForContent(e.target.checked)}
                color="primary"
              />
            }
            label="Show info Before Form"
          />
          <FormControlLabel
            control={
              <Switch
                checked={isValidFormBackForContent}
                onChange={(e) => setIsValidFormBackForContent(e.target.checked)}
                color="primary"
              />
            }
            label="Show info After Form"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleAddContentDialogClose} 
            variant="outlined"
            sx={{
              borderColor: theme.palette.mode === 'dark' ? '#fb8c00' : '#ff9800',
              color: theme.palette.mode === 'dark' ? '#fb8c00' : '#ff9800',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(251, 140, 0, 0.08)' : 'rgba(255, 152, 0, 0.08)',
                borderColor: theme.palette.mode === 'dark' ? '#fb8c00' : '#ff9800',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddContentSubmit} 
            variant="contained"
            disabled={!selectedFormToAddContent || (!isValidFormFrontForContent && !isValidFormBackForContent)}
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? '#1a237e' : '#1976d2',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#0d47a1' : '#1565c0',
              }
            }}
          >
            Enter
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default ContentTable;