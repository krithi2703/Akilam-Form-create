import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Typography,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from 'react-toastify';
import api from "../axiosConfig";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import OtpInput from 'react-otp-input';
import { sendWhatsAppMessage } from "../whatsappService";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Register({ setIsLoggedIn, setIsFormOnlyUser }) {
  const navigate = useNavigate();
  const query = useQuery();
  const { formId } = useParams();

  const [tab, setTab] = useState(0);
  const [forceFormRegister, setForceFormRegister] = useState(false);
  const [showDistributeMessage, setShowDistributeMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showEditPreviewDialog, setShowEditPreviewDialog] = useState(false); // New state
  const [showAlreadyRegisteredDialog, setShowAlreadyRegisteredDialog] = useState(false);
  const [isExistingFormUser, setIsExistingFormUser] = useState(false);

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [formRegData, setFormRegData] = useState({
    identifier: "",
  });
  const [firebaseUID, setFirebaseUID] = useState(null); // New state for Firebase UID
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [formName, setFormName] = useState("");

  const [otp, setOtp] = useState("");
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [provisionalToken, setProvisionalToken] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // Timer effect for OTP
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleEditPreview = () => {
    setShowEditPreviewDialog(false);
    // Navigate to ViewSubmissions.jsx, passing formId and identifier
    // Assuming ViewSubmissions.jsx expects formId and identifier in the URL or state
    navigate(`/form/submissions/${formId}?identifier=${formRegData.identifier}`);
  };

  const formNo = query.get("formNo");

  useEffect(() => {
    if (formId) {
      setTab(2);
      setForceFormRegister(true);
    } else {
      setTab(0);
      setForceFormRegister(false);
    }
  }, [formId]);

  useEffect(() => {
    if (formId) {
      const fetchFormName = async () => {
        try {
          const response = await api.get(`/public/formname/${formId}`);
          if (response.data.FormName) {
            setFormName(response.data.FormName);
          }
        } catch (error) {
          console.error("Error fetching form name:", error);
        }
      };
      fetchFormName();
    }
  }, [formId]);

  const handleChange = (event, newValue) => {
    setTab(newValue);
    setAlert(null);
  };

  const validateEmail = (email) => {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(String(email).toLowerCase());
  };

  const validateIdentifier = (identifier) => {
    const isPhone = /^(\+91)?[0-9]{10}$/.test(identifier);
    return isPhone;
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });

    if (name === "email") {
      if (value && !validateEmail(value)) {
        setEmailError("Invalid email address.");
      } else {
        setEmailError("");
      }
    }
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleFormRegChange = (e) => {
    const { name, value } = e.target;
    setFormRegData({ ...formRegData, [name]: value });

    if (name === 'identifier') {
        if (value && !validateIdentifier(value)) {
            setIdentifierError('Please enter a valid 10-digit phone number, optionally with a +91 prefix.');
        } else {
            setIdentifierError('');
        }
    }
  };

  const handleSendOtp = async (identifier) => {
    console.log("Sending OTP to:", identifier);
    setOtpLoading(true);
    setOtpError("");
    
    try {
      let fetchedFormName = formName;
      if (!fetchedFormName && formId) {
        try {
          const response = await api.get(`/public/formname/${formId}`);
          if (response.data.FormName) {
            fetchedFormName = response.data.FormName;
            setFormName(response.data.FormName);
          }
        } catch (error) {
          console.error("Error fetching form name:", error);
        }
      }

      const phoneNumber = identifier.startsWith('+91') ? identifier : `+91${identifier}`;
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      //const otpCode = "123456";
      

      console.log("Generated OTP:", otpCode);
       const message = `Your OTP for ${fetchedFormName ? `the ${fetchedFormName} form` : 'the form'} is: ${otpCode}`;
       await sendWhatsAppMessage(phoneNumber, message);

      sessionStorage.setItem('currentOtp', otpCode); 

      setShowOtpDialog(true);
      setOtpTimer(35); // Start 35-second timer
      setCanResendOtp(false);
      toast.success("OTP sent successfully via WhatsApp!");
    } catch (error) {
      console.error("Error sending OTP via WhatsApp:", error);
      let errorMessage = "Failed to send OTP via WhatsApp. Please try again later.";
      
      setAlert({ type: "error", message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    
    setOtp("");
    setOtpError("");
    await handleSendOtp(formRegData.identifier);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }
    
    setOtpLoading(true);
    setOtpError("");
    
    try {
      const storedOtp = sessionStorage.getItem('currentOtp');

      if (otp === storedOtp) {
        await api.post("/formregister/verify-whatsapp-otp", {
          identifier: formRegData.identifier,
          otp: otp,
        });
        
        handleFormRegistrationSuccess({ token: provisionalToken }, formRegData.identifier);
        setShowOtpDialog(false);
        sessionStorage.removeItem('currentOtp');
        setOtpTimer(0);
        setCanResendOtp(false);
      } else {
        throw new Error("Invalid OTP. Please try again.");
      }

    } catch (error) {
      console.error("Error verifying OTP:", error);
      let errorMessage = error.message || "Invalid OTP. Please try again.";
      
      setOtpError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (type) => {
    setLoading(true);
    setAlert(null);

    let url = "";
    let data = {};

    if (type === "login") {
      url = "/users/login";
      data = loginData;
    } else if (type === "register") {
      if (emailError) {
        setAlert({ type: "error", message: "Please enter a valid email address." });
        setLoading(false);
        return;
      }
      url = "/users/register";
      data = registerData;
    } else if (type === "formregister") {
      if (identifierError) {
        setAlert({ type: "error", message: "Please enter a valid phone number." });
        setLoading(false);
        return;
      }
      
      // Check for existing submission before proceeding
      try {
        const checkRes = await api.get(`/formvalues/check-submission?formId=${formId}`, {
          headers: { userid: formRegData.identifier },
        });

        if (checkRes.data.hasSubmission) {
          setIsExistingFormUser(true);
          setShowAlreadyRegisteredDialog(true);
          setLoading(false);
          return; // Stop here and show the dialog
        }
      } catch (err) {
        // If the check fails, log it but proceed as a new user for robustness
        console.error("Error checking for existing submission:", err);
      }

      url = "/formregister/insert";
      data = {
        identifier: formRegData.identifier,
        formId: formId,
      };
    }

    if (Object.values(data).some((val) => !val && val !== 0)) {
      if (type === "formregister" && !data.identifier) {
        setAlert({ type: "error", message: "Phone No is required." });
        setLoading(false);
        return;
      } else if (type !== "formregister") {
        setAlert({ type: "error", message: "All fields are required" });
        setLoading(false);
        return;
      } 
    }

    try {
      const res = await api.post(url, data);
      const result = res.data;

      if (type === "login") {
        sessionStorage.setItem("userId", loginData.email);
        sessionStorage.setItem("userName", result.name);
        sessionStorage.setItem("token", result.token);
        if (result.userRole) {
          sessionStorage.setItem("userRole", result.userRole);
        }
        sessionStorage.setItem("isFormOnlyUser", "false");

        setIsLoggedIn(true);
        if (setIsFormOnlyUser) setIsFormOnlyUser(false);

        toast.success(`Welcome, ${result.name}`);
        setLoginData({ email: "", password: "" });
        navigate("/home");

      } else if (type === "register") {
        toast.success("Registration successful! Please log in to continue.");
        setRegisterData({ name: "", email: "", password: "" });
        setTab(0);

      } else if (type === "formregister") {
        setProvisionalToken(result.token);
        setIsExistingFormUser(false); // It's a new registration for this form
        await handleSendOtp(formRegData.identifier);
      }
    } catch (err) {
      console.error("Form registration error:", err);
      let errorMessage = err.response?.data?.message || err.message || "Something went wrong during registration.";
      setAlert({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleFormRegistrationSuccess = (result, identifier) => {
    sessionStorage.setItem("userId", identifier);
    sessionStorage.setItem("userName", identifier);
    sessionStorage.setItem("isFormOnlyUser", "true");
    sessionStorage.setItem("token", result.token);

    setIsLoggedIn(true);
    if (setIsFormOnlyUser) setIsFormOnlyUser(true);

    toast.success(`Welcome, ${identifier}`);
    setFormRegData({ identifier: "" });
    setShowDistributeMessage(true);
    setTimeout(() => {
      if (isExistingFormUser) {
        navigate(`/form/submissions/${formId}`, { state: { formNo: formNo || 1 } });
      } else {
        navigate(`/form/view/${formId}?formNo=${formNo || 1}`, { replace: true });
      }
    }, 1500);
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Card elevation={6} sx={{ width: "100%", p: 3 }}>
          <CardContent>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              {forceFormRegister
                ? "Register to Access Form"
                : tab === 0 
                ? "Sign In"
                : "Sign Up"}
            </Typography>

            {alert && (
              <Alert severity={alert.type} sx={{ mt: 2, mb: 2 }}>
                {alert.message}
              </Alert>
            )}

            {!forceFormRegister && (
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs value={tab} onChange={handleChange} centered  >
                  <Tab label="Login" sx={{ backgroundColor: tab === 0 ? 'grey.300' : 'transparent' }} />
                  <Tab label="Register" sx={{ backgroundColor: tab === 1 ? 'grey.300' : 'transparent' }} />
                </Tabs>
              </Box>
            )}

            {tab === 0 && !forceFormRegister && (
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={() => handleSubmit("login")}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Sign In"}
                </Button>
              </Box>
            )}

            {tab === 1 && !forceFormRegister && (
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  error={!!emailError}
                  helperText={emailError}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={() => handleSubmit("register")}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Sign Up"}
                </Button>
              </Box>
            )}

            {forceFormRegister && (
              <Box component="form" sx={{ mt: 1 }}>
                {showDistributeMessage ? (
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{ textAlign: "center", mt: 3 }}
                  >
                    Verification Successful! Redirecting to form...
                  </Typography>
                ) : (
                  <>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="identifier"
                      label="Phone No"
                      name="identifier"
                      value={formRegData.identifier}
                      onChange={handleFormRegChange}
                      error={!!identifierError}
                      helperText={identifierError || "Please enter your 10-digit WhatsApp number to receive an OTP."}
                    />
                    <Button
                      type="button"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                      onClick={() => handleSubmit("formregister")}
                      disabled={loading || !/^(\+91)?[0-9]{10}$/.test(formRegData.identifier)}
                    >
                      {loading ? <CircularProgress size={24} /> : "Register and Continue"}
                    </Button>
                  </>
                )}
              </Box>
            )}
            
            <div id="recaptcha-container" style={{ marginTop: '1rem' }}></div>

            {!forceFormRegister && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box textAlign="center">
                  <Button
                    onClick={() => setTab(tab === 0 ? 1 : 0)}
                    variant="text"
                    sx={{ textTransform: "none" }}
                  >
                    {tab === 0
                      ? "Don't have an account? Sign Up"
                      : "Already have an account? Sign In"}
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      <Dialog open={showAlreadyRegisteredDialog} onClose={() => setShowAlreadyRegisteredDialog(false)}>
        <DialogTitle>User Already Registered</DialogTitle>
        <DialogContent>
          <Typography>
            This phone number is already registered. Do you want to edit the submission?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAlreadyRegisteredDialog(false)}>Cancel</Button>
          <Button onClick={async () => {
            setShowAlreadyRegisteredDialog(false);
            await handleSendOtp(formRegData.identifier);
          }} variant="contained">
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showOtpDialog} onClose={() => !otpLoading && setShowOtpDialog(false)}>
        <DialogTitle>Verify Phone Number</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            A 6-digit OTP has been sent to your WhatsApp number. Please enter it below.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2, flexDirection: 'column' }}>
            <OtpInput
              value={otp}
              onChange={(otpValue) => {
                setOtp(otpValue);
                if (otpValue.length === 6) {
                  setOtpError('');
                }
              }}
              numInputs={6}
              inputType="tel"
              renderSeparator={<span style={{ width: '8px' }}></span>}
              renderInput={(props) => <input {...props} />}
              shouldAutoFocus={true}
              containerStyle={{ justifyContent: 'center' }}
              inputStyle={{
                width: '2.5rem',
                height: '3rem',
                fontSize: '1.2rem',
                borderRadius: '4px',
                border: `1px solid ${otpError ? '#d32f2f' : 'rgba(0, 0, 0, 0.23)'}`,
              }}
            />
            {otpError && (
              <Typography variant="caption" color="error" sx={{ textAlign: 'center', mt: 1 }}>
                {otpError}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" color="textSecondary">
              {otpTimer > 0 ? (
                `Resend OTP in ${otpTimer} seconds`
              ) : (
                "Didn't receive the OTP?"
              )}
            </Typography>
            
            <Button 
              onClick={handleResendOtp}
              disabled={!canResendOtp || otpLoading}
              variant="text"
              size="small"
              color="primary"
            >
              Resend OTP
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowOtpDialog(false);
              setOtpTimer(0);
              setCanResendOtp(false);
            }} 
            disabled={otpLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleVerifyOtp} 
            variant="contained" 
            disabled={otpLoading || otp.length !== 6}
          >
            {otpLoading ? <CircularProgress size={24} /> : "Verify"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}