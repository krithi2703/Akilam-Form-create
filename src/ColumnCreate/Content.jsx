import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../axiosConfig'; // Import your custom axios instance
import { toast } from 'react-toastify'; // Import toast

export default function Content() {
    const location = useLocation();
    const navigate = useNavigate();
    const { formId: passedFormId, formName: passedFormName, isValidFormFront, isValidFormBack } = location.state || {};

    const [formData, setFormData] = useState({
        formNameDisplay: passedFormName || '',
        contentHeader: '',
        contentLines: ''
    });
    const [actualFormId, setActualFormId] = useState(passedFormId || null);
    const userId = sessionStorage.getItem('userId'); // Get userId

    useEffect(() => {
        // console.log('Content.jsx received state:', location.state);
        // console.log('Passed Form ID:', passedFormId);
        // console.log('Passed Form Name:', passedFormName);

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

    const handleSubmit = async (e) => { // Make handleSubmit async
        e.preventDefault();
        if (!actualFormId) {
            toast.error('Form ID is missing. Cannot submit.');
            console.error('Form ID is missing. Cannot submit.');
            return;
        }
        if (!userId) {
            toast.error('User ID is missing. Please log in.');
            console.error('User ID is missing. Please log in.');
            return;
        }

        try {
            const response = await api.post('/content-dtl', { // Corrected endpoint
                FormId: actualFormId,
                ContentHeader: formData.contentHeader,
                ContentLines: formData.contentLines,
                isValidFormFront: isValidFormFront || false,
                isValidFormBack: isValidFormBack || false,
                UserId: userId
            });

            if (response.status === 201) {
                toast.success('Content details inserted successfully!');
                navigate('/content-details');
                setFormData({
                    formNameDisplay: passedFormName || '',
                    contentHeader: '',
                    contentLines: ''
                });
            } else {
                toast.error(response.data.message || 'Failed to insert content details.');
            }
        } catch (error) {
            console.error('Error inserting content details:', error);
            toast.error(error.response?.data?.message || 'Internal server error.');
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', backgroundColor: 'background.default' }}>
            {/* Form Section - Takes remaining space */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                p: { xs: 2, md: 4 }
            }}>
                <Card sx={{ width: '100%', padding: 2, backgroundColor: 'background.paper' }} elevation={8}>
                    <CardContent sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        p: { xs: 3, md: 4 }
                    }}>
                        <Typography
                            variant="h4"
                            component="h2"
                            sx={{
                                mb: 4,
                                textAlign: 'center',
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                fontSize: { xs: '1.75rem', md: '2.125rem' }
                            }}
                        >
                            Content Creation Portal
                        </Typography>


                        <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    label="Form Name"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    name="formNameDisplay"
                                    value={formData.formNameDisplay}
                                    onChange={handleChange}
                                    required
                                    InputProps={{ readOnly: true }} // Make it read-only as it's passed from FormDetails
                                    sx={{
                                        mb: 3,
                                        display: 'none', // Hide the TextField
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            fontSize: '1.1rem',
                                            '&:hover fieldset': {
                                                borderColor: '#667eea',
                                                borderWidth: '2px'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#764ba2',
                                                borderWidth: '2px'
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontSize: '1.1rem',
                                            '&.Mui-focused': {
                                                color: '#764ba2',
                                                fontWeight: 'bold'
                                            }
                                        }
                                    }}
                                />
                                <TextField
                                    label="Content Header"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    name="contentHeader"
                                    value={formData.contentHeader}
                                    onChange={handleChange}
                                    required
                                    sx={{
                                        mb: 3,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            fontSize: '1.1rem',
                                            '&:hover fieldset': {
                                                borderColor: '#667eea',
                                                borderWidth: '2px'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#764ba2',
                                                borderWidth: '2px'
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontSize: '1.1rem',
                                            '&.Mui-focused': {
                                                color: '#764ba2',
                                                fontWeight: 'bold'
                                            }
                                        }
                                    }}
                                />
                                <TextField
                                    label="Content Lines"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    name="contentLines"
                                    value={formData.contentLines}
                                    onChange={handleChange}
                                    multiline
                                    rows={8}
                                    required
                                    sx={{
                                        mb: 3,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            fontSize: '1.1rem',
                                            '&:hover fieldset': {
                                                borderColor: '#667eea',
                                                borderWidth: '2px'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#764ba2',
                                                borderWidth: '2px'
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontSize: '1.1rem',
                                            '&.Mui-focused': {
                                                color: '#764ba2',
                                                fontWeight: 'bold'
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            {/* Buttons at the bottom */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 3,
                                mt: 'auto',
                                pt: 4,
                                flexDirection: { xs: 'column', sm: 'row' }
                            }}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => setFormData({ formNameDisplay: passedFormName || '', contentHeader: '', contentLines: '' })}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'rgba(103, 58, 183, 0.04)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                                        },
                                        transition: 'all 0.3s ease-in-out'
                                    }}
                                >
                                    Clear Form
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 10px 25px rgba(118, 75, 162, 0.5)'
                                        },
                                        transition: 'all 0.3s ease-in-out'
                                    }}
                                >
                                    Create Content
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}