import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Container,
    Tabs,
    Tab,
    Button,
    AppBar,
    Toolbar,
    IconButton,
    Divider
} from '@mui/material';
import { Add as AddIcon, Logout as LogoutIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import api from '../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';

export default function ContentDetails({ isFormOnlyUser }) {
    const { formName: paramFormName, side: paramSide, formId: paramFormId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [formName, setFormName] = useState("");
    const [formDetails, setFormDetails] = useState(null); // New state for form details
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTabs, setActiveTabs] = useState({});

    const formId = isFormOnlyUser ? paramFormId : paramFormName;

    useEffect(() => {
        const fetchContentDetails = async () => {
            try {
                let url = '/content-dtl';
                let config = {};
                if (isFormOnlyUser) {
                    url = '/content-dtl/form';
                    config = { headers: { formid: parseInt(formId, 10) } };
                }

                const response = await api.get(url, config);
                // Check if content is empty for form-only user
                if (isFormOnlyUser && (!response.data || (response.data.front.length === 0 && response.data.back.length === 0))) {
                    navigate(`/form/view/${formId}`);
                    return; // Stop further processing in this component
                }
                setContent(response.data);
            } catch (err) {
                // If there's an error fetching content, it might mean no content exists or a server error.
                // In this case, for form-only user, we should also navigate to FormPage.
                console.error("Error fetching content details:", err);
                if (isFormOnlyUser) {
                    setError('Failed to fetch content details for this form. Please proceed to the form.');
                } else {
                    setError(err.response?.data?.message || err.message || 'Failed to fetch content details.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (!isFormOnlyUser) {
            fetchContentDetails();
        } else if (formId) {
            fetchContentDetails();
        }
    }, [formId, isFormOnlyUser, navigate]);

    useEffect(() => {
        const fetchFormDetails = async () => {
            if (isFormOnlyUser && formId) {
                try {
                    const response = await api.get(`/formname/${formId}`);
                    if (response.data) {
                        setFormName(response.data.FormName);
                        setFormDetails(response.data); // Set full form details
                       // console.log("Form Details:", response.data); // ADD THIS LINE
                    }
                } catch (error) {
                    console.error("Error fetching form details:", error);
                }
            }
        };
        fetchFormDetails();
    }, [formId, isFormOnlyUser]);

    const handleTabChange = (formName, newValue) => {
        setActiveTabs(prev => ({ ...prev, [formName]: newValue }));
    };

    const renderContent = (content, index) => (
        <Box key={String(content.ContentId || content.id || index)} sx={{ mb: 2 }}>
            {content.ContentHeader && (
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        fontWeight: '600',
                        color: '#5a6c7d',
                        mb: 1,
                        fontSize: '1.1rem'
                    }}
                >
                    {content.ContentHeader}
                </Typography>
            )}
            {content.ContentLines && (
                <Box component="ul" sx={{
                    pl: 3,
                    m: 0,
                    '& li': {
                        mb: 0.5,
                        lineHeight: 1.6
                    }
                }}>
                    {content.ContentLines.split(/[.]+/).map((point, pointIndex) => {
                        const trimmedPoint = point.trim();
                        return trimmedPoint && (
                            <Typography
                                key={pointIndex}
                                component="li"
                                variant="body1"
                                color="text.secondary"
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    fontSize: '0.95rem'
                                }}
                            >
                                {trimmedPoint}
                            </Typography>
                        );
                    })}
                </Box>
            )}
        </Box>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
            </Container>
        );
    }

    const renderAppBar = () => {
        if (isFormOnlyUser) {
            return (
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {formName}
                        </Typography>
                        <IconButton color="inherit" onClick={() => {
                            sessionStorage.clear();
                            window.location.href = `/${formId}`;
                        }}>
                            <LogoutIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
            );
        }
        // If isFormOnlyUser is false, return null to hide the AppBar
        return null;
    };

    if (isFormOnlyUser) {
        if (!content || (!content.front && !content.back)) {
            return (
                <>
                    {renderAppBar()}
                    <Container>
                        <Alert severity="warning" sx={{ mt: 4 }}>Content for form not found.</Alert>
                    </Container>
                </>
            );
        }

        const { front, back } = content;
        const contentToShow = paramSide === 'front' ? front : back;
        const title = formName;

        return (
            <>
                {renderAppBar()}
                <Container maxWidth="md" sx={{ py: 4 }}>
                    <Box>
                        {isFormOnlyUser && formDetails?.bannerImage && (
                            <Box
                                component="img"
                                src={`${api.defaults.baseURL.replace('/api', '')}${formDetails.bannerImage}`}
                                alt={`${title} Banner`}
                                sx={{
                                    width: '100%',
                                    height: '150px',
                                    objectFit: 'fill',
                                    borderRadius: '6px',
                                    mb: 1,
                                    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
                                }}
                            />
                        )}
                        <Card
                            elevation={3}
                            sx={{
                                borderRadius: '6px',
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Typography
                                    variant="h5"
                                    component="div"
                                    sx={{
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        color: 'transparent',
                                        mb: 3,
                                        pb: 2,
                                        borderBottom: '2px solid #f0f0f0',
                                        textAlign: 'center'
                                    }}
                                >
                                    {title}
                                </Typography>
                                <Box>
                                    {contentToShow && contentToShow.length > 0 ? contentToShow.map(renderContent) : <Typography>No content available.</Typography>}
                                </Box>
                                <Divider sx={{ my: 2, borderBottomWidth: 2, borderColor: 'grey.400' }} />
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                {paramSide === 'front' && (
                                    <Button variant="contained" onClick={() => navigate(`/form/view/${formId}`)}>
                                        Next
                                    </Button>
                                )}
                                {paramSide === 'back' && (
                                    <Button variant="contained" onClick={() => { sessionStorage.clear(); window.location.href = `/${formId}`; }}>
                                        Finish
                                    </Button>
                                )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Container>
            </>
        );
    }

    // Regular user view (grouped content)
    const groupedContent = content;
    if (paramFormName && paramSide) {
        const singleContent = groupedContent[paramFormName];

        if (!singleContent) {
            return (
                <>
                    {renderAppBar()}
                    <Container>
                        <Alert severity="warning" sx={{ mt: 4 }}>Content for form "{paramFormName}" not found.</Alert>
                    </Container>
                </>
            );
        }

        const { front, back, bannerImage } = singleContent;
        const contentToShow = paramSide === 'front' ? front : back;
        const title = `${paramFormName}`;

        return (
            <>
            {renderAppBar()}
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box>
                    {bannerImage && (
                        <Box
                            component="img"
                            src={`${api.defaults.baseURL.replace('/api', '')}${bannerImage}`}
                            alt={`${paramFormName} Banner`}
                            sx={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'fill',
                                borderRadius: '6px',
                                mb: 1,
                                boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
                            }}
                        />
                    )}
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: '6px',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                variant="h5"
                                component="div"
                                sx={{
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                    mb: 3,
                                    pb: 2,
                                    borderBottom: '2px solid #f0f0f0',
                                    textAlign: 'center'
                                }}
                            >
                                {title}
                            </Typography>
                            <Box>
                                {contentToShow && contentToShow.length > 0 ? contentToShow.map(renderContent) : <Typography>No content available.</Typography>}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Container>
            </>
        );
    }

    const groupedContentArray = Object.entries(groupedContent).sort(([a], [b]) => a.localeCompare(b));

    return (
        <>
        {renderAppBar()}
        <Container maxWidth="md" sx={{ py: 4 }}>
            {groupedContentArray.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6">No content details found.</Typography>
                    <Typography>It looks like there's no content here yet. Go ahead and create some!</Typography>
                </Card>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {groupedContentArray.map(([formName, { front, back, bannerImage }]) => {
                        const activeTab = activeTabs[formName] || 0;

                        return (
                            <Box key={formName}>
                                {bannerImage && (
                                    <Box
                                        component="img"
                                        src={`${api.defaults.baseURL.replace('/api', '')}${bannerImage}`}
                                        alt={`${formName} Banner`}
                                        sx={{
                                            width: '100%',
                                            height: '150px',
                                            objectFit: 'fill',
                                            borderRadius: '6px',
                                            mb: 1,
                                            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
                                        }}
                                    />
                                )}
                                
                                <Card
                                    elevation={3}
                                    sx={{
                                        borderRadius: '6px',
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography
                                            variant="h5"
                                            component="div"
                                            sx={{
                                                fontWeight: 'bold',
                                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                color: 'transparent',
                                                mb: 3,
                                                pb: 2,
                                                borderBottom: '2px solid #f0f0f0',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {formName}
                                        </Typography>

                                        <>
                                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                                <Tabs value={activeTab} onChange={(e, newValue) => handleTabChange(formName, newValue)} centered>
                                                    <Tab label="Front Side" />
                                                    <Tab label="Back Side" />
                                                </Tabs>
                                            </Box>
                                            <Box sx={{ pt: 2 }}>
                                                {activeTab === 0 && (
                                                    <Box>
                                                        {front.map(renderContent)}
                                                    </Box>
                                                )}
                                                {activeTab === 1 && (
                                                    <Box>
                                                        {back.map(renderContent)}
                                                    </Box>
                                                )}
                                            </Box>
                                        </>
                                    </CardContent>
                                </Card>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </Container>
        </>
    );
}