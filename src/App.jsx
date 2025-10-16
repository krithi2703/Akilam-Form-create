import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RingLoader } from 'react-spinners';

import Register from './Registration/Register';
import CreateColumn from './ColumnCreate/CreateColumn';
import MasterTable from './Tables/MasterTable';
import FormTable from './Tables/FormTable';
import FormPage from './ColumnCreate/FormPage';
import CreateColumnTable from './Tables/CreateColumnTable';
import FormDetails from './ColumnCreate/FormDetails'
import MasterPage from './ColumnCreate/MasterPage';
import Home from './Home/Home';
import Content from './ColumnCreate/Content'; // Import Content component
import NavBar from './SideBar/Navbar';
import SideBar from './SideBar/Sidebar';
import ViewSubmissions from './ColumnCreate/ViewSubmissions';
import UserList from './Registration/UserList'; // Import the new UserList component
import ContentDetails from './ColumnCreate/ContentDetails'; // Import ContentDetails component --- IGNORE ---
import ContentTable from './Tables/ContentTable'; // Import ContentTable component --- IGNORE ---
import axios from "axios";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem('userId'));
  const [isFormOnlyUser, setIsFormOnlyUser] = useState(sessionStorage.getItem('isFormOnlyUser') === 'true');
  const formOnlyUserFormId = sessionStorage.getItem('formId'); // Get formId for form-only user
  const location = useLocation();
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1000); // Show loader for 1 second
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    setIsFormOnlyUser(false);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#3f51b5' },
      secondary: { main: '#f50057' },
    },
  });

  // For "form only" users, the main layout (NavBar and SideBar) is never shown.
  // They have their own layout within the FormPage component.
  const shouldShowLayout = isLoggedIn && !isFormOnlyUser;

  if (appLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <RingLoader color="skyblue" size={150} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer autoClose={1000} />
      {isLoggedIn ? (
        <>
          {shouldShowLayout && (
            <NavBar
              toggleDarkMode={toggleDarkMode}
              darkMode={darkMode}
              handleLogout={handleLogout}
              showSidebarToggle={!isFormOnlyUser}
              toggleSidebar={toggleSidebar}
            />
          )}
          <Box sx={{ display: 'flex' }}>
            {shouldShowLayout && (
              <SideBar
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                darkMode={darkMode}
              />
            )}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                py: shouldShowLayout ? 3 : 0,
                px: 0, // No padding for form-only views
                mt: shouldShowLayout ? 8 : 0,
                transition: 'margin-left 0.3s, width 0.3s',
                width:
                  shouldShowLayout && sidebarOpen
                    ? 'calc(100% - 240px)'
                    : '100%',
                ml: shouldShowLayout && sidebarOpen ? '240px' : 0,
                textAlign: 'left',
              }}
            >
              <Routes>
                {isFormOnlyUser ? (
                  <>
                    <Route path="/form/view/:formId" element={<FormPage isPreview={false} setIsLoggedIn={setIsLoggedIn} setIsFormOnlyUser={setIsFormOnlyUser} />} />
                    <Route path="/form/submissions/:formId" element={<ViewSubmissions />} />
                    <Route path="/content-details/:formId/:side" element={<ContentDetails isFormOnlyUser={true} />} />
                    {/* Redirect any other path for form-only user to their form */}
                    <Route path="*" element={formOnlyUserFormId ? <Navigate to={`/content-details/${formOnlyUserFormId}/front`} replace /> : <Navigate to={`/`} replace />} />
                  </>
                ) : (
                  <>
                    {/* Routes for regular logged-in users */}
                    <Route path="/home" element={<Home />} />
                    <Route path="/create-column" element={<CreateColumn />} />
                    <Route path="/mastertable" element={<MasterTable />} />
                    <Route path="/masterpage" element={<MasterPage />} />
                    <Route path="/formtable" element={<FormTable />} />
                    <Route path="/create-column-table" element={<CreateColumnTable />} />
                    <Route path="/formdetails" element={<FormDetails />} />
                    <Route path="/content" element={<Content />} /> {/* New route for Content component */}
                    <Route path="/content-table" element={<ContentTable />} /> {/* New route for ContentTable component --- IGNORE --- */}
                    <Route path="/content-details/:formName/:side" element={<ContentDetails isFormOnlyUser={false} handleLogout={handleLogout}/>} />
                    <Route path="/content-details" element={<ContentDetails isFormOnlyUser={false} handleLogout={handleLogout}/>} /> {/* New route for ContentDetails component --- IGNORE --- */}
                    <Route path="/form/preview/:formId" element={<FormPage isPreview={true} />} />
                    <Route path="/form/view/:formId" element={<FormPage isPreview={false} setIsLoggedIn={setIsLoggedIn} setIsFormOnlyUser={setIsFormOnlyUser} />} />
                    <Route path="/form/submissions/:formId" element={<ViewSubmissions />} />
                    <Route path="/users" element={<UserList />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </>
                )}
              </Routes>
            </Box>
          </Box>
        </>
      ) : (
        <Routes>
          <Route
            path="/"
            element={<Register setIsLoggedIn={setIsLoggedIn} setIsFormOnlyUser={setIsFormOnlyUser} />}
          />
          <Route
            path="/login"
            element={<Register setIsLoggedIn={setIsLoggedIn} setIsFormOnlyUser={setIsFormOnlyUser} />}
          />
          <Route
            path="/form-login/:formId"
            element={<Register setIsLoggedIn={setIsLoggedIn} setIsFormOnlyUser={setIsFormOnlyUser} />}
          />
          <Route
            path="/:formId"
            element={<Register setIsLoggedIn={setIsLoggedIn} setIsFormOnlyUser={setIsFormOnlyUser} />}
          />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route
            path="/form/register/:formId"
            element={<Register setIsLoggedIn={setIsLoggedIn} setIsFormOnlyUser={setIsFormOnlyUser} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </ThemeProvider>
  );
}

export default App;
