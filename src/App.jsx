import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Register from './Registration/Register';
import CreateColumn from './ColumnCreate/CreateColumn';
import MasterTable from './Tables/MasterTable';
import FormTable from './Tables/FormTable';
import FormPage from './ColumnCreate/FormPage';
import CreateColumnTable from './Tables/CreateColumnTable';
import FormDetails from './ColumnCreate/FormDetails'
import MasterPage from './ColumnCreate/MasterPage';
import Home from './Home/Home';
import NavBar from './SideBar/Navbar';
import SideBar from './SideBar/Sidebar';
import ViewSubmissions from './ColumnCreate/ViewSubmissions';
import UserList from './Registration/UserList'; // Import the new UserList component
import axios from "axios";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem('userId'));
  const [isFormOnlyUser, setIsFormOnlyUser] = useState(sessionStorage.getItem('isFormOnlyUser') === 'true');
  const token = sessionStorage.getItem("token");
  const location = useLocation();

  // Removed the useEffect as useState initialization is sufficient for initial load
  // and setIsLoggedIn prop handles subsequent updates.

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

  // For "form only" users, certain routes should hide the main layout.
  const isFormViewRoute = isFormOnlyUser && location.pathname.startsWith('/form/view/');
  const isFormPreviewRoute = isFormOnlyUser && location.pathname.startsWith('/form/preview/');
  const isViewSubmissionsRoute = isFormOnlyUser && location.pathname.startsWith('/form/submissions/');

  // The register route for a "form only" user is any path that isn't a main app page.
  const isFormRegisterRoute =
    isFormOnlyUser &&
    /^\/[^/]+$/.test(location.pathname) &&
    ![
      '/home',
      '/create-column',
      '/mastertable',
      '/masterpage',
      '/formtable',
      '/create-column-table',
      '/formdetails',
      '/view-submissions',
      '/users', // Add new route to the list
    ].includes(location.pathname);

  // The main layout should be shown for all logged-in users,
  // except for "form only" users on the specific routes defined above.
  const shouldShowLayout =
    isLoggedIn &&
    !isFormViewRoute &&
    !isFormPreviewRoute &&
    !isViewSubmissionsRoute &&
    !isFormRegisterRoute;

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
                p: 3,
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
                <Route path="/home" element={<Home />} />
                <Route path="/create-column" element={<CreateColumn />} />
                <Route path="/mastertable" element={<MasterTable />} />
                <Route path="/masterpage" element={<MasterPage />} />
                <Route path="/formtable" element={<FormTable />} />
                <Route path="/create-column-table" element={<CreateColumnTable />} />
                <Route path="/formdetails" element={<FormDetails />} />
                <Route path="/form/preview/:formId" element={<FormPage isPreview={true} />} />
                <Route path="/form/view/:formId" element={<FormPage isPreview={false} />} />
                <Route path="/form/submissions/:formId" element={<ViewSubmissions />} />
                <Route path="/users" element={<UserList />} /> {/* New route for UserList */}

                <Route
                  path="/form/register/:formId"
                  element={
                    <Register
                      setIsLoggedIn={setIsLoggedIn}
                      setIsFormOnlyUser={setIsFormOnlyUser}
                    />
                  }
                />

                <Route path="*" element={<Navigate to="/home" replace />} />
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
