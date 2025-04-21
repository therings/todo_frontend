import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Tab,
  Tabs,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// API URL configuration with fallback
const API_URL = process.env.REACT_APP_API_URL?.endsWith("/")
  ? process.env.REACT_APP_API_URL.slice(0, -1)
  : process.env.REACT_APP_API_URL ||
    "https://todo-backend-nine-wine.vercel.app";

const LoginAndRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Reset form data and error messages when switching tabs
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setLoginError("");
    setRegisterError("");
    setSuccess("");
    if (newValue === 0) {
      setLoginData({
        email: "",
        password: "",
      });
    } else {
      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }
  };

  // Handle form input changes for login
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Handle form input changes for registration
  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Send login request to backend
      const response = await axios.post(
        `${API_URL}/api/users/login`,
        loginData
      );
      // Store user data and token in context
      login(response.data.user, response.data.token);
      setSuccess("Login successful!");
      // Redirect to home page after successful login
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      setLoginError(error.response?.data?.error || "Login failed");
    }
  };

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    // Validate password confirmation
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }
    try {
      // Send registration request to backend
      await axios.post(`${API_URL}/api/users/register`, {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
      });
      setSuccess("Registration successful! You can now login.");
      // Switch to login tab after successful registration
      setTimeout(() => {
        setTab(0);
      }, 2000);
    } catch (error) {
      setRegisterError(error.response?.data?.error || "Registration failed");
    }
  };

  // Handle Google OAuth login success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send Google credential to backend for verification
      const response = await axios.post(`${API_URL}/api/users/google-login`, {
        credential: credentialResponse.credential,
      });
      // Store user data and token in context
      login(response.data.user, response.data.token);
      setSuccess("Login successful!");
      // Redirect to home page after successful login
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      setLoginError("Google login failed");
    }
  };

  // Handle Google OAuth login error
  const handleGoogleError = () => {
    setLoginError("Google login failed");
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {tab === 0 ? (
            <>
              {loginError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {loginError}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
              <form onSubmit={handleLogin}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
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
                  autoComplete="current-password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign In
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography color="textSecondary">OR</Typography>
                </Divider>

                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                  />
                </Box>
              </form>
            </>
          ) : (
            <>
              {registerError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {registerError}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
              <form onSubmit={handleRegister}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
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
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign Up
                </Button>
              </form>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginAndRegister;
