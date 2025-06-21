'use client';

import { useState } from 'react';
import {
  Container, Box, Typography, Button, TextField, MenuItem, Divider,
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [view, setView] = useState<'choose' | 'login' | 'register'>('choose');

  // Shared states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register states
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [departmentId, setDepartmentId] = useState('');
  const [semesterId, setSemesterId] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/${data.user.role.toLowerCase()}`);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Login request failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          departmentId: departmentId ? parseInt(departmentId) : null,
          semesterId: semesterId ? parseInt(semesterId) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setView('login');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Register request failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 4, borderRadius: 2, backgroundColor: '#f9f9f9' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Welcome to GeoAttend
        </Typography>

        {/* Step 1: Choose Login or Register */}
        {view === 'choose' && (
          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 2 }}
              onClick={() => setView('login')}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={() => setView('register')}
            >
              Register
            </Button>
          </Box>
        )}

        {/* Step 2: Login */}
        {view === 'login' && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom align="center">
              Login
            </Typography>
            <form onSubmit={handleLogin}>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                type="email"
                required
              />
              <TextField
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                type="password"
                required
              />
              {error && <Typography color="error" mt={1}>{error}</Typography>}
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Login
              </Button>
              <Button onClick={() => setView('choose')} fullWidth sx={{ mt: 1 }}>
                Back
              </Button>
            </form>
          </>
        )}

        {/* Step 3: Register */}
        {view === 'register' && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom align="center">
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
              />
              <TextField
                label="Role"
                select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                fullWidth
                margin="normal"
              >
                <MenuItem value="STUDENT">Student</MenuItem>
                <MenuItem value="TEACHER">Teacher</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </TextField>
              <TextField
                label="Department ID"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                fullWidth
                margin="normal"
              />
              {role === 'STUDENT' && (
                <TextField
                  label="Semester ID"
                  value={semesterId}
                  onChange={(e) => setSemesterId(e.target.value)}
                  fullWidth
                  margin="normal"
                />
              )}
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                type="email"
                required
              />
              <TextField
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                type="password"
                required
              />
              {error && <Typography color="error" mt={1}>{error}</Typography>}
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Register
              </Button>
              <Button onClick={() => setView('choose')} fullWidth sx={{ mt: 1 }}>
                Back
              </Button>
            </form>
          </>
        )}
      </Box>
    </Container>
  );
}
