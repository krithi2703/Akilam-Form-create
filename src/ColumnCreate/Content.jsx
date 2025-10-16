import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    TextField, 
    Button, 
    Box, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    Paper,
    Fade,
    Zoom,
    Container,
    useTheme
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Create as CreateIcon,
    Clear as ClearIcon,
    Send as SendIcon,
    Description as DescriptionIcon,
    Title as TitleIcon
} from '@mui/icons-material';
import api from '../axiosConfig';
import { toast } from 'react-toastify';
import { RingLoader } from 'react-spinners';

export default function Content() {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { formId: passedFormId, formName: passedFormName, isValidFormFront, isValidFormBack } = location.state || {};

    const [formData, setFormData] = useState({
        formNameDisplay: passedFormName || '',
        contentHeader: '',
        contentLines: ''
    });
    const [actualFormId, setActualFormId] = useState(passedFormId || null);
    const userId = sessionStorage.getItem('userId');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (passedFormId) {
            setActualFormId(passedFormId);
        }
        if (passedFormName) {
            setFormData(prevData => ({
                ...prevData,
                formNameDisplay: passedFormName
            }));
        }
    }, [passedFormId, passedFormName, location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!actualFormId) {
            toast.error('📝 Form ID is missing. Cannot submit.');
            setIsSubmitting(false);
            return;
        }
        if (!userId) {
            toast.error('🔐 User ID is missing. Please log in.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await api.post('/content-dtl', {
                FormId: actualFormId,
                ContentHeader: formData.contentHeader,
                ContentLines: formData.contentLines,
                isValidFormFront: isValidFormFront || false,
                isValidFormBack: isValidFormBack || false,
                UserId: userId
            });

            if (response.status === 201) {
                toast.success('🎉 Content created successfully!');
                setConfirmDialogOpen(true);
            } else {
                toast.error('❌ ' + (response.data.message || 'Failed to create content.'));
            }
        } catch (error) {
            console.error('Error inserting content details:', error);
            toast.error('🚨 ' + (error.response?.data?.message || 'Internal server error.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmYes = () => {
        setConfirmDialogOpen(false);
        navigate('/content-table');
    };

    const handleConfirmNo = () => {
        setConfirmDialogOpen(false);
        setFormData({
            formNameDisplay: passedFormName || '',
            contentHeader: '',
            contentLines: ''
        });
    };

    const clearForm = () => {
        setFormData({
            formNameDisplay: passedFormName || '',
            contentHeader: '',
            contentLines: ''
        });
        toast.info('🧹 Form cleared!');
    };

    return (
        <Box 
            sx={{ 
                minHeight: '100vh',
                backgroundColor: theme.palette.background.default,
                py: 4,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center'
            }}
        >
            <Container maxWidth="lg">
                <Fade in={true} timeout={800}>
                    <Box>
                        {/* Header Section */}
                        <Paper 
                            elevation={8}
                            sx={{
                                mb: 4,
                                p: 3,
                                backgroundColor: theme.palette.background.paper,
                                borderRadius: 4,
                                textAlign: 'center',
                                border: `1px solid ${theme.palette.divider}`
                            }}
                        >
                            <Typography
                                variant="h3"
                                component="h1"
                                sx={{
                                    fontWeight: 'bold',
                                    background: theme.palette.mode === 'dark' 
                                        ? 'linear-gradient(45deg, #90caf9, #ce93d8)'
                                        : 'linear-gradient(45deg, #667eea, #764ba2)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 2,
                                    fontSize: { xs: '2rem', md: '3rem' }
                                }}
                            >
                                <CreateIcon sx={{ fontSize: 'inherit' }} />
                                Content Creation Portal
                            </Typography>
                            {passedFormName && (
                                <Zoom in={true} timeout={1000}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mt: 2,
                                            color: theme.palette.text.secondary,
                                            fontStyle: 'italic',
                                            fontWeight: 500
                                        }}
                                    >
                                        Creating content for: <strong>{passedFormName}</strong>
                                    </Typography>
                                </Zoom>
                            )}
                        </Paper>

                        {/* Form Section */}
                        <Zoom in={true} timeout={600}>
                            <Card 
                                sx={{ 
                                    borderRadius: 4,
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    boxShadow: theme.shadows[8],
                                    overflow: 'visible'
                                }} 
                                elevation={16}
                            >
                                <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                                    <Box 
                                        component="form" 
                                        onSubmit={handleSubmit} 
                                        sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            gap: 3
                                        }}
                                    >
                                        {/* Content Header Field */}
                                        <Box sx={{ position: 'relative' }}>
                                            <TextField
                                                label="Content Header"
                                                variant="outlined"
                                                fullWidth
                                                name="contentHeader"
                                                value={formData.contentHeader}
                                                onChange={handleChange}
                                                required
                                                InputProps={{
                                                    startAdornment: (
                                                        <TitleIcon 
                                                            sx={{ 
                                                                mr: 1, 
                                                                color: theme.palette.primary.main,
                                                                opacity: 0.7
                                                            }} 
                                                        />
                                                    ),
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 3,
                                                        fontSize: '1.1rem',
                                                        paddingLeft: 1,
                                                        transition: 'all 0.3s ease',
                                                        '&:hover fieldset': {
                                                            borderColor: theme.palette.primary.main,
                                                            borderWidth: '2px',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: theme.palette.secondary.main,
                                                            borderWidth: '2px',
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        fontSize: '1rem',
                                                        '&.Mui-focused': {
                                                            color: theme.palette.secondary.main,
                                                            fontWeight: 'bold',
                                                            transform: 'translate(14px, -9px) scale(0.75)'
                                                        }
                                                    }
                                                }}
                                                placeholder="Enter a compelling title for your content..."
                                            />
                                        </Box>

                                        {/* Content Lines Field */}
                                        <Box sx={{ position: 'relative' }}>
                                            <TextField
                                                label="Content Body"
                                                variant="outlined"
                                                fullWidth
                                                name="contentLines"
                                                value={formData.contentLines}
                                                onChange={handleChange}
                                                multiline
                                                rows={10}
                                                required
                                                InputProps={{
                                                    startAdornment: (
                                                        <DescriptionIcon 
                                                            sx={{ 
                                                                mr: 1, 
                                                                color: theme.palette.primary.main,
                                                                opacity: 0.7,
                                                                alignSelf: 'flex-start',
                                                                mt: 1.5
                                                            }} 
                                                        />
                                                    ),
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 3,
                                                        fontSize: '1.1rem',
                                                        paddingLeft: 1,
                                                        transition: 'all 0.3s ease',
                                                        alignItems: 'flex-start',
                                                        '&:hover fieldset': {
                                                            borderColor: theme.palette.primary.main,
                                                            borderWidth: '2px',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: theme.palette.secondary.main,
                                                            borderWidth: '2px',
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        fontSize: '1rem',
                                                        '&.Mui-focused': {
                                                            color: theme.palette.secondary.main,
                                                            fontWeight: 'bold',
                                                            transform: 'translate(14px, -9px) scale(0.75)'
                                                        }
                                                    }
                                                }}
                                                placeholder="Write your amazing content here... Be creative and engaging!"
                                            />
                                        </Box>

                                        {/* Character Count */}
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                textAlign: 'right',
                                                color: formData.contentLines.length > 1000 ? 'error.main' : 'text.secondary',
                                                fontWeight: formData.contentLines.length > 1000 ? 'bold' : 'normal'
                                            }}
                                        >
                                            {formData.contentLines.length} / 1000 characters
                                        </Typography>

                                        {/* Action Buttons */}
                                        <Box 
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                gap: 3,
                                                mt: 2,
                                                flexDirection: { xs: 'column', sm: 'row' }
                                            }}
                                        >
                                            <Button
                                                type="button"
                                                variant="outlined"
                                                color="secondary"
                                                onClick={clearForm}
                                                startIcon={<ClearIcon />}
                                                disabled={isSubmitting}
                                                sx={{
                                                    px: 4,
                                                    py: 1.5,
                                                    borderRadius: 3,
                                                    fontWeight: 'bold',
                                                    textTransform: 'none',
                                                    fontSize: '1.1rem',
                                                    borderWidth: 2,
                                                    '&:hover': {
                                                        borderWidth: 2,
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: 4
                                                    },
                                                    transition: 'all 0.3s ease-in-out'
                                                }}
                                            >
                                                Clear All
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                disabled={isSubmitting}
                                                startIcon={isSubmitting ? <RingLoader color="white" size={24} /> : <SendIcon />}
                                                sx={{
                                                    px: 5,
                                                    py: 1.5,
                                                    borderRadius: 3,
                                                    fontWeight: 'bold',
                                                    textTransform: 'none',
                                                    fontSize: '1.1rem',
                                                    boxShadow: 4,
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: 8
                                                    },
                                                    '&:disabled': {
                                                        backgroundColor: theme.palette.action.disabled,
                                                        transform: 'none',
                                                        boxShadow: 'none'
                                                    },
                                                    transition: 'all 0.3s ease-in-out'
                                                }}
                                            >
                                                {isSubmitting ? 'Creating...' : 'Publish Content'}
                                            </Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Zoom>
                    </Box>
                </Fade>

                {/* Success Confirmation Dialog */}
                <Dialog
                    open={confirmDialogOpen}
                    onClose={() => setConfirmDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 4,
                            backgroundColor: theme.palette.background.paper
                        }
                    }}
                >
                    <DialogTitle 
                        sx={{ 
                            textAlign: 'center',
                            background: theme.palette.mode === 'dark' 
                                ? 'linear-gradient(45deg, #90caf9, #ce93d8)'
                                : 'linear-gradient(45deg, #667eea, #764ba2)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            fontWeight: 'bold',
                            fontSize: '1.5rem'
                        }}
                    >
                        🎉 Content Successfully Created!
                    </DialogTitle>
                    <DialogContent>
                        <Typography 
                            textAlign="center" 
                            sx={{ fontSize: '1.1rem', color: 'text.secondary', lineHeight: 1.6 }}
                        >
                            Your content has been saved successfully! 
                            <br />
                            Would you like to view all your content or create more?
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
                        <Button 
                            onClick={handleConfirmNo}
                            variant="outlined"
                            color="primary"
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                fontWeight: 'bold',
                                textTransform: 'none'
                            }}
                        >
                            Create More
                        </Button>
                        <Button 
                            onClick={handleConfirmYes}
                            variant="contained"
                            color="primary"
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                fontWeight: 'bold',
                                textTransform: 'none'
                            }}
                        >
                            View All Content
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}