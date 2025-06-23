'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container, Box, Typography, Button, TextField, MenuItem, Divider,
  FormControl, InputLabel, Select, Alert, useMediaQuery, createTheme, ThemeProvider,
  CircularProgress,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, register, getCurrentUser } from '~/lib/api';
import { Navbar } from '~/components/Navbar';

// Define light and dark themes (unchanged)
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0288d1' },
    secondary: { main: '#ff6f61' },
    background: { default: '#e8f0fe', paper: '#ffffff' },
    text: { primary: '#0d1b2a', secondary: '#455a64' },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-0.5px' },
    h5: { fontWeight: 700 },
    body1: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          textTransform: 'none',
          padding: '14px 28px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          '&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.2)' },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(6px)',
          '&:focus': { backgroundColor: 'rgba(255,255,255,0.15)' },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#0d1b2a',
          '&:hover': { backgroundColor: '#e8f0fe' },
          '&.Mui-selected': { backgroundColor: '#0288d1', color: '#ffffff' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#455a64',
          '&.Mui-focused': { color: '#0288d1' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            backgroundColor: 'background.default',
          },
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#40c4ff' },
    secondary: { main: '#ff8a80' },
    background: { default: '#0a1929', paper: '#172a46' },
    text: { primary: '#e6f0fa', secondary: '#90a4ae' },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-0.5px' },
    h5: { fontWeight: 700 },
    body1: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          textTransform: 'none',
          padding: '14px 28px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          '&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.3)' },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(6px)',
          color: '#e6f0fa',
          '&:focus': { backgroundColor: 'rgba(255,255,255,0.1)' },
        },
        icon: {
          color: '#e6f0fa',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#e6f0fa',
          '&:hover': { backgroundColor: '#3b527a' },
          '&.Mui-selected': { backgroundColor: '#40c4ff', color: '#0a1929' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#90a4ae',
          '&.Mui-focused': { color: '#40c4ff' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            backgroundColor: 'background.default',
          },
        },
      },
    },
  },
});

// Child component with useSearchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceRegister = searchParams.get('register') === 'true';
  const [view, setView] = useState<'choose' | 'login' | 'register'>(forceRegister ? 'register' : 'choose');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [departmentId, setDepartmentId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [semesters, setSemesters] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const currentTheme = useMemo(() => {
    if (themeMode === 'light') return lightTheme;
    if (themeMode === 'dark') return darkTheme;
    return prefersDarkMode ? darkTheme : lightTheme;
  }, [themeMode, prefersDarkMode]);

  // Check for existing session
  const checkSession = useCallback(async () => {
    if (hasCheckedSession) {
      setLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('jwt_token');
      if (forceRegister) {
        sessionStorage.removeItem('jwt_token');
        setHasCheckedSession(true);
        setLoading(false);
        return;
      }

      if (!token) {
        sessionStorage.removeItem('jwt_token');
        setHasCheckedSession(true);
        setLoading(false);
        return;
      }

      const user = await getCurrentUser();
      if (user) {
        router.push(`/${user.role.toLowerCase()}`);
      } else {
        sessionStorage.removeItem('jwt_token');
      }
    } catch (error) {
      sessionStorage.removeItem('jwt_token');
    } finally {
      setHasCheckedSession(true);
      setLoading(false);
    }
  }, [router, forceRegister, hasCheckedSession]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Load dropdown data for registration
  useEffect(() => {
    if (view === 'register') {
      async function fetchData() {
        try {
          const [departmentsRes, semestersRes] = await Promise.all([
            fetch('/api/departments', { headers: { 'Content-Type': 'application/json' } }),
            fetch('/api/semesters', { headers: { 'Content-Type': 'application/json' } }),
          ]);
          if (!departmentsRes.ok) throw new Error('Failed to load departments');
          if (!semestersRes.ok) throw new Error('Failed to load semesters');
          const departmentsData = await departmentsRes.json();
          const semestersData = await semestersRes.json();
          setDepartments(departmentsData);
          setSemesters(semestersData);
        } catch (err) {
          setError((err as Error).message || 'Failed to load data');
        }
      }
      fetchData();
    }
  }, [view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      router.push(`/${user.role.toLowerCase()}`);
    } catch (err) {
      setError((err as Error).message || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Validate required fields
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (role !== 'ADMIN' && !departmentId) {
      setError('Department is required for Students and Teachers');
      return;
    }
    if (role === 'STUDENT' && !semesterId) {
      setError('Semester is required for Students');
      return;
    }
    try {
      const user = await register(
        name,
        email,
        password,
        role,
        departmentId ? parseInt(departmentId) : undefined,
        role === 'STUDENT' && semesterId ? parseInt(semesterId) : undefined
      );
      router.push(`/${user.role.toLowerCase()}`);
    } catch (err) {
      setError((err as Error).message || 'Registration failed');
    }
  };

  if (loading) {
    return null; // Prevent rendering until session check completes
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <Navbar themeMode={themeMode} setThemeMode={setThemeMode} />
      <Box
        sx={{
          minHeight: '100vh',
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'radial-gradient(circle at top left, #e0f7fa, #ffffff)'
              : 'radial-gradient(circle at bottom right, #0a1929, #172a46)',
          py: 8,
        }}
      >
        <Container maxWidth="sm" sx={{ py: 8, mt: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <Typography
              variant="h3"
              sx={{
                mb: 6,
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #0288d1, #ff6f61)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '120px',
                  height: '5px',
                  background: 'linear-gradient(90deg, #0288d1, #ff6f61)',
                  borderRadius: '2px',
                },
              }}
            >
              Welcome to GeoAttend
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box
              sx={{
                p: 4,
                borderRadius: 4,
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(8px)',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(255,255,255,0.1)',
                border: (theme) =>
                  theme.palette.mode === 'light'
                    ? '1px solid rgba(255,255,255,0.6)'
                    : '1px solid rgba(255,255,255,0.2)',
                position: 'relative',
                overflow: 'hidden',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '6px',
                  background: 'linear-gradient(90deg, #0288d1, #ff6f61)',
                  borderRadius: '2px',
                },
              }}
            >
              {view === 'choose' && (
                <Box textAlign="center" mt={4}>
                  <motion.div whileHover={{ scale: 1.05 }} style={{ marginBottom: 16 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => setView('login')}
                      sx={{ mb: 2 }}
                    >
                      Login
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} style={{ marginBottom: 16 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      onClick={() => setView('register')}
                      sx={{ mb: 2 }}
                    >
                      Register
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        sessionStorage.removeItem('jwt_token');
                        setView('choose');
                      }}
                    >
                      Start New Session
                    </Button>
                  </motion.div>
                </Box>
              )}

              {view === 'login' && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 'medium' }}>
                    Login
                  </Typography>
                  <form onSubmit={handleLogin}>
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      margin="normal"
                      required
                      variant="outlined"
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      margin="normal"
                      required
                      variant="outlined"
                    />
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -30 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Alert severity="error" sx={{ mt: 3, borderRadius: '16px' }}>
                            {error}
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Button type="submit" variant="contained" color="primary" sx={{ px: 6, py: 2 }}>
                          Login
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => setView('choose')}
                          sx={{ px: 6, py: 2 }}
                        >
                          Back
                        </Button>
                      </motion.div>
                    </Box>
                  </form>
                </>
              )}

              {view === 'register' && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 'medium' }}>
                    Register
                  </Typography>
                  <form onSubmit={handleRegister}>
                    <TextField
                      label="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                      margin="normal"
                      required
                      variant="outlined"
                    />
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel id="role-select-label">Role</InputLabel>
                      <Select
                        labelId="role-select-label"
                        value={role}
                        label="Role"
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <MenuItem value="STUDENT">Student</MenuItem>
                        <MenuItem value="TEACHER">Teacher</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal" required={role !== 'ADMIN'}>
                      <InputLabel id="department-select-label">
                        {role === 'ADMIN' ? 'Department (Optional)' : 'Department'}
                      </InputLabel>
                      <Select
                        labelId="department-select-label"
                        value={departmentId}
                        label={role === 'ADMIN' ? 'Department (Optional)' : 'Department'}
                        onChange={(e) => setDepartmentId(e.target.value)}
                      >
                        <MenuItem value="">
                          {role === 'ADMIN' ? 'None (Optional)' : 'Select Department'}
                        </MenuItem>
                        {departments.map((dep) => (
                          <MenuItem key={dep.id} value={dep.id}>
                            {dep.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {role === 'STUDENT' && (
                      <FormControl fullWidth margin="normal" required>
                        <InputLabel id="semester-select-label">Semester</InputLabel>
                        <Select
                          labelId="semester-select-label"
                          value={semesterId}
                          label="Semester"
                          onChange={(e) => setSemesterId(e.target.value)}
                        >
                          <MenuItem value="">Select Semester</MenuItem>
                          {semesters.map((sem) => (
                            <MenuItem key={sem.id} value={sem.id}>
                              {sem.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      margin="normal"
                      required
                      variant="outlined"
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      margin="normal"
                      required
                      variant="outlined"
                    />
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Alert severity="error" sx={{ mt: 3, borderRadius: '16px' }}>
                            {error}
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Button type="submit" variant="contained" color="primary" sx={{ px: 4, py: 2 }}>
                          Register
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => setView('choose')}
                          sx={{ px: 4, py: 2 }}
                        >
                          Cancel
                        </Button>
                      </motion.div>
                    </Box>
                  </form>
                </>
              )}
            </Box>
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

// Main page component with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<CircularProgress sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}>
      <LoginContent />
    </Suspense>
  );
}