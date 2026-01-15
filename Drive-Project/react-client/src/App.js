import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { api } from './api';
import Login from './Login';
import Register from './Register';
import Home from './Home-Components/Home';

export const ThemeContext = createContext();
export const AuthContext = createContext();

function App() {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const displayName = localStorage.getItem('displayName');
    const profilePic = localStorage.getItem('profilePic');

    if (token && username) {
      return { username, displayName: displayName || username, profilePic };
    }
    return null;
  });

  const toggleTheme = () => setTheme(curr => curr === 'light' ? 'dark' : 'light');

  // Verify user exists in database on app load
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.getUser(token);
          if (!userData || userData.error) {
            // User doesn't exist, clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('displayName');
            localStorage.removeItem('profilePic');
            setUser(null);
          }
        } catch (err) {
          // API error, user likely doesn't exist
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('displayName');
          localStorage.removeItem('profilePic');
          setUser(null);
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  useEffect(() => {
    document.body.className = theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white';
  }, [theme]);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Show loading while verifying user
  if (loading) {
    return (
      <div className={`d-flex justify-content-center align-items-center min-vh-100 ${theme === 'light' ? 'bg-light' : 'bg-dark'}`}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div className={theme === 'light' ? 'bg-light min-vh-100' : 'bg-dark text-white min-vh-100'}>
          <Router>
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
              <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
            </Routes>
          </Router>
        </div>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;