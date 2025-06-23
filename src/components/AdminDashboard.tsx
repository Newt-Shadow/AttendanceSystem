
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container, Box, Typography, Button, TextField, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody,
  FormControl, InputLabel, Alert, CircularProgress, useMediaQuery, createTheme, ThemeProvider,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { Navbar } from '~/components/Navbar';
import { fetchWithAuth, getCurrentUser } from '~/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  department?: { id: number; name: string };
  semester?: { id: number; name: string };
}

interface Subject {
  id: number;
  name: string;
  department: { id: number; name: string };
  semester?: { id: number; name: string };
  teacher: { id: number; name: string };
}

interface Department {
  id: number;
  name: string;
}

interface Semester {
  id: number;
  name: string;
}

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
    MuiTable: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.6)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: 'primary.main',
          color: 'white',
        },
        body: {
          fontWeight: 500,
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
    MuiTable: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: 'primary.main',
          color: 'white',
        },
        body: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'ADMIN' | 'TEACHER' | 'STUDENT',
    departmentId: '' as string,
    semesterId: '' as string,
  });
  const [newSubject, setNewSubject] = useState({
    name: '',
    departmentId: '' as string,
    semesterId: '' as string,
    teacherId: '' as string,
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const router = useRouter();

  const currentTheme = useMemo(() => {
    if (themeMode === 'light') return lightTheme;
    if (themeMode === 'dark') return darkTheme;
    return prefersDarkMode ? darkTheme : lightTheme;
  }, [themeMode, prefersDarkMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
          setError('Unauthorized access. Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        const [usersRes, subjectsRes, departmentsRes, semestersRes] = await Promise.all([
          fetchWithAuth('/api/admin/users'),
          fetchWithAuth('/api/admin/subjects'),
          fetchWithAuth('/api/departments'),
          fetchWithAuth('/api/semesters'),
        ]);

        if (!usersRes.ok) {
          const errorData = await usersRes.json();
          throw new Error(`Users fetch failed: ${errorData.error || await usersRes.text()}`);
        }
        if (!subjectsRes.ok) {
          const errorData = await subjectsRes.json();
          throw new Error(`Subjects fetch failed: ${errorData.error || await subjectsRes.text()}`);
        }
        if (!departmentsRes.ok) {
          const errorData = await departmentsRes.json();
          throw new Error(`Departments fetch failed: ${errorData.error || await departmentsRes.text()}`);
        }
        if (!semestersRes.ok) {
          const errorData = await semestersRes.json();
          throw new Error(`Semesters fetch failed: ${errorData.error || await semestersRes.text()}`);
        }

        setUsers(await usersRes.json());
        setSubjects(await subjectsRes.json());
        setDepartments(await departmentsRes.json());
        setSemesters(await semestersRes.json());
        setError('');
      } catch (err: any) {
        console.error('AdminDashboard: Error fetching data:', err);
        setError(err.message || 'Failed to load data');
        setTimeout(() => router.push('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.departmentId) {
      setError('Please fill in all required user fields');
      return;
    }
    try {
      setLoading(true);
      const parsedDepartmentId = newUser.departmentId ? parseInt(newUser.departmentId, 10) : undefined;
      const parsedSemesterId = newUser.semesterId ? parseInt(newUser.semesterId, 10) : undefined;

      if (parsedDepartmentId && isNaN(parsedDepartmentId)) {
        throw new Error('Invalid department ID');
      }
      if (parsedSemesterId && isNaN(parsedSemesterId)) {
        throw new Error('Invalid semester ID');
      }

      const res = await fetchWithAuth('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUser,
          departmentId: parsedDepartmentId,
          semesterId: parsedSemesterId,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to add user: ${errorData.error || await res.text()}`);
      }
      const updatedUsers = await fetchWithAuth('/api/admin/users').then(res => res.json());
      setUsers(updatedUsers);
      setNewUser({ name: '', email: '', password: '', role: 'STUDENT', departmentId: '', semesterId: '' });
      setError('');
    } catch (err: any) {
      console.error('AdminDashboard: Error adding user:', err);
      setError(err.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name || !newSubject.departmentId || !newSubject.semesterId || !newSubject.teacherId) {
      setError('Please fill in all required subject fields');
      return;
    }
    try {
      setLoading(true);
      const parsedDepartmentId = parseInt(newSubject.departmentId, 10);
      const parsedSemesterId = parseInt(newSubject.semesterId, 10);
      const parsedTeacherId = parseInt(newSubject.teacherId, 10);

      if (isNaN(parsedDepartmentId)) {
        throw new Error('Invalid department ID');
      }
      if (isNaN(parsedSemesterId)) {
        throw new Error('Invalid semester ID');
      }
      if (isNaN(parsedTeacherId)) {
        throw new Error('Invalid teacher ID');
      }

      const res = await fetchWithAuth('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSubject,
          departmentId: parsedDepartmentId,
          semesterId: parsedSemesterId,
          teacherId: parsedTeacherId,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to add subject: ${errorData.error || await res.text()}`);
      }
      const updatedSubjects = await fetchWithAuth('/api/admin/subjects').then(res => res.json());
      setSubjects(updatedSubjects);
      setNewSubject({ name: '', departmentId: '', semesterId: '', teacherId: '' });
      setError('');
    } catch (err: any) {
      console.error('AdminDashboard: Error adding subject:', err);
      setError(err.message || 'Failed to add subject');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={currentTheme}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress size={70} thickness={4.5} />
        </Box>
      </ThemeProvider>
    );
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
        <Container maxWidth="lg" sx={{ py: 8, mt: 6 }}>
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
              Admin Dashboard
            </Typography>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
              >
                <Alert severity="error" sx={{ mb: 6, borderRadius: '16px' }}>
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Management */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box
              component="form"
              onSubmit={handleUserSubmit}
              sx={{
                mb: 8,
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
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'medium' }}>
                Add New User
              </Typography>
              <TextField
                label="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                fullWidth
                margin="normal"
                required
                variant="outlined"
                error={!newUser.name && !!error}
              />
              <TextField
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                fullWidth
                margin="normal"
                required
                variant="outlined"
                error={!newUser.email && !!error}
              />
              <TextField
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                fullWidth
                margin="normal"
                required
                variant="outlined"
                error={!newUser.password && !!error}
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  value={newUser.role}
                  label="Role"
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'ADMIN' | 'TEACHER' | 'STUDENT' })}
                >
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="TEACHER">Teacher</MenuItem>
                  <MenuItem value="STUDENT">Student</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="department-select-label">Department</InputLabel>
                <Select
                  labelId="department-select-label"
                  value={newUser.departmentId}
                  label="Department"
                  onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
                  error={!newUser.departmentId && !!error}
                >
                  <MenuItem value="">Select Department</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id.toString()}>{dept.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal" disabled={newUser.role !== 'STUDENT'}>
                <InputLabel id="semester-select-label">Semester</InputLabel>
                <Select
                  labelId="semester-select-label"
                  value={newUser.semesterId}
                  label="Semester"
                  onChange={(e) => setNewUser({ ...newUser, semesterId: e.target.value })}
                >
                  <MenuItem value="">Select Semester</MenuItem>
                  {semesters.map((sem) => (
                    <MenuItem key={sem.id} value={sem.id.toString()}>{sem.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <motion.div whileHover={{ scale: 1.05 }} style={{ marginTop: 16 }}>
                <Button type="submit" variant="contained" color="primary" sx={{ px: 6, py: 2 }} disabled={loading}>
                  Add User
                </Button>
              </motion.div>
            </Box>
          </motion.div>

          {/* Subject Management */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Box
              component="form"
              onSubmit={handleSubjectSubmit}
              sx={{
                mb: 8,
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
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'medium' }}>
                Add New Subject
              </Typography>
              <TextField
                label="Subject Name"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                fullWidth
                margin="normal"
                required
                variant="outlined"
                error={!newSubject.name && !!error}
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="subject-department-select-label">Department</InputLabel>
                <Select
                  labelId="subject-department-select-label"
                  value={newSubject.departmentId}
                  label="Department"
                  onChange={(e) => setNewSubject({ ...newSubject, departmentId: e.target.value })}
                  error={!newSubject.departmentId && !!error}
                >
                  <MenuItem value="">Select Department</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id.toString()}>{dept.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="subject-semester-select-label">Semester</InputLabel>
                <Select
                  labelId="subject-semester-select-label"
                  value={newSubject.semesterId}
                  label="Semester"
                  onChange={(e) => setNewSubject({ ...newSubject, semesterId: e.target.value })}
                  error={!newSubject.semesterId && !!error}
                >
                  <MenuItem value="">Select Semester</MenuItem>
                  {semesters.map((sem) => (
                    <MenuItem key={sem.id} value={sem.id.toString()}>{sem.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="teacher-select-label">Teacher</InputLabel>
                <Select
                  labelId="teacher-select-label"
                  value={newSubject.teacherId}
                  label="Teacher"
                  onChange={(e) => setNewSubject({ ...newSubject, teacherId: e.target.value })}
                  error={!newSubject.teacherId && !!error}
                >
                  <MenuItem value="">Select Teacher</MenuItem>
                  {users
                    .filter((u: User) => u.role === 'TEACHER')
                    .map((teacher) => (
                      <MenuItem key={teacher.id} value={teacher.id.toString()}>{teacher.name}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <motion.div whileHover={{ scale: 1.05 }} style={{ marginTop: 16 }}>
                <Button type="submit" variant="contained" color="primary" sx={{ px: 6, py: 2 }} disabled={loading}>
                  Add Subject
                </Button>
              </motion.div>
            </Box>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                fontWeight: 'medium',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: 0,
                  width: '100px',
                  height: '5px',
                  background: 'linear-gradient(90deg, #0288d1, #ff6f61)',
                  borderRadius: '2px',
                },
              }}
            >
              Users
            </Typography>
            <Table sx={{ mb: 8 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Semester</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.department?.name || 'N/A'}</TableCell>
                    <TableCell>{user.semester?.name || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>

          {/* Subjects Table */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                fontWeight: 'medium',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: 0,
                  width: '100px',
                  height: '5px',
                  background: 'linear-gradient(90deg, #0288d1, #ff6f61)',
                  borderRadius: '2px',
                },
              }}
            >
              Subjects
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Teacher</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.department.name}</TableCell>
                    <TableCell>{subject.semester?.name || 'N/A'}</TableCell>
                    <TableCell>{subject.teacher.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  );
}