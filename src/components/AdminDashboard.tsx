'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container, Box, Typography, Button, TextField, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody,
  FormControl, InputLabel, Alert, CircularProgress, useMediaQuery, createTheme, ThemeProvider, Tabs, Tab, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions,
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
  teacher?: { id: number; name: string } | null;
}

interface Department {
  id: number;
  name: string;
}

interface Semester {
  id: number;
  name: string;
}

interface AttendanceRecord {
  id: number;
  student: { id: number; name: string; email: string };
  session: {
    id: number;
    subject: { id: number; name: string; department: { id: number; name: string }; semester?: { id: number; name: string } };
    teacher: { id: number; name: string };
  };
  checkInTime: string;
  checkOutTime?: string;
  method: string;
}

interface UserStats {
  totalUsers: number;
  usersByDepartmentAndSemester: Array<{
    department: { id: number; name: string } | null;
    semester: { id: number; name: string } | null;
    count: number;
  }>;
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
          minWidth: '200px',
          '& .MuiSelect-select': {
            paddingRight: '32px !important',
            paddingLeft: '14px',
            paddingY: '14px',
          },
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
          fontWeight: 600,
          fontSize: '1rem',
          '&.Mui-focused': { color: '#0288d1' },
          '&.MuiFormLabel-filled': { transform: 'translate(12px, -9px) scale(0.75)' },
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
          color: 'black',
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
          minWidth: '200px',
          '& .MuiSelect-select': {
            paddingRight: '32px !important',
            paddingLeft: '14px',
            paddingY: '14px',
          },
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
          fontWeight: 600,
          fontSize: '1rem',
          '&.Mui-focused': { color: '#40c4ff' },
          '&.MuiFormLabel-filled': { transform: 'translate(12px, -9px) scale(0.75)' },
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
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ totalUsers: 0, usersByDepartmentAndSemester: [] });
  const [filteredStats, setFilteredStats] = useState<UserStats>({ totalUsers: 0, usersByDepartmentAndSemester: [] });
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
  const [userFilters, setUserFilters] = useState({
    role: '' as string,
    departmentId: '' as string,
    semesterId: '' as string,
  });
  const [subjectFilters, setSubjectFilters] = useState({
    departmentId: '' as string,
    semesterId: '' as string,
  });
  const [attendanceFilters, setAttendanceFilters] = useState({
    departmentId: '' as string,
    semesterId: '' as string,
    subjectId: '' as string,
    userId: '' as string,
  });
  const [statsFilters, setStatsFilters] = useState({
    departmentId: '' as string,
    semesterId: '' as string,
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [tabValue, setTabValue] = useState<number>(0);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const [editSubjectOpen, setEditSubjectOpen] = useState<boolean>(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
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

        const [usersRes, subjectsRes, departmentsRes, semestersRes, userStatsRes] = await Promise.all([
          fetchWithAuth('/api/admin/users'),
          fetchWithAuth('/api/admin/subjects'),
          fetchWithAuth('/api/departments'),
          fetchWithAuth('/api/semesters'),
          fetchWithAuth('/api/admin/user-stats'),
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
        if (!userStatsRes.ok) {
          const errorData = await userStatsRes.json();
          throw new Error(`User stats fetch failed: ${errorData.error || await userStatsRes.text()}`);
        }

        const usersData = await usersRes.json();
        const subjectsData = await subjectsRes.json();
        const departmentsData = await departmentsRes.json();
        const semestersData = await semestersRes.json();
        const statsData = await userStatsRes.json();

        setUsers(usersData);
        setFilteredUsers(usersData);
        setSubjects(subjectsData);
        setFilteredSubjects([]);
        setDepartments(departmentsData);
        setSemesters(semestersData);
        setUserStats(statsData);
        setFilteredStats({ totalUsers: 0, usersByDepartmentAndSemester: [] });
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

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        ...(attendanceFilters.departmentId && { departmentId: attendanceFilters.departmentId }),
        ...(attendanceFilters.semesterId && { semesterId: attendanceFilters.semesterId }),
        ...(attendanceFilters.subjectId && { subjectId: attendanceFilters.subjectId }),
        ...(attendanceFilters.userId && { userId: attendanceFilters.userId }),
      }).toString();
      const res = await fetchWithAuth(`/api/admin/attendance?${query}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Attendance fetch failed: ${errorData.error || await res.text()}`);
      }
      setAttendanceRecords(await res.json());
      setError('');
    } catch (err: any) {
      console.error('AdminDashboard: Error fetching attendance:', err);
      setError(err.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = () => {
    const filtered = users.filter((user) => {
      return (
        (!userFilters.role || user.role === userFilters.role) &&
        (!userFilters.departmentId || user.department?.id.toString() === userFilters.departmentId) &&
        (!userFilters.semesterId || user.semester?.id.toString() === userFilters.semesterId)
      );
    });
    setFilteredUsers(filtered);
  };

  const handleSubjectSearch = () => {
    const filtered = subjects.filter((subject) => {
      return (
        (!subjectFilters.departmentId || subject.department.id.toString() === subjectFilters.departmentId) &&
        (!subjectFilters.semesterId || subject.semester?.id.toString() === subjectFilters.semesterId)
      );
    });
    setFilteredSubjects(filtered);
  };

  const handleStatsSearch = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        ...(statsFilters.departmentId && { departmentId: statsFilters.departmentId }),
        ...(statsFilters.semesterId && { semesterId: statsFilters.semesterId }),
      }).toString();
      const res = await fetchWithAuth(`/api/admin/user-stats?${query}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`User stats fetch failed: ${errorData.error || await res.text()}`);
      }
      setFilteredStats(await res.json());
      setError('');
    } catch (err: any) {
      console.error('AdminDashboard: Error fetching user stats:', err);
      setError(err.message || 'Failed to fetch user stats');
    } finally {
      setLoading(false);
    }
  };

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
      setFilteredUsers(updatedUsers);
      setNewUser({ name: '', email: '', password: '', role: 'STUDENT', departmentId: '', semesterId: '' });
      setError('');
    } catch (err: any) {
      console.error('AdminDashboard: Error adding user:', err);
      setError(err.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleUserDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      setLoading(true);
      const res = await fetchWithAuth(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to delete user: ${errorData.error || await res.text()}`);
      }
      const updatedUsers = await fetchWithAuth('/api/admin/users').then(res => res.json());
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter((user: User) => (
        (!userFilters.role || user.role === userFilters.role) &&
        (!userFilters.departmentId || user.department?.id.toString() === userFilters.departmentId) &&
        (!userFilters.semesterId || user.semester?.id.toString() === userFilters.semesterId)
      )));
      setError('');
    } catch (err: any) {
      console.error('AdminDashboard: Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
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
      setFilteredSubjects(updatedSubjects.filter((subject: Subject) => (
        (!subjectFilters.departmentId || subject.department.id.toString() === subjectFilters.departmentId) &&
        (!subjectFilters.semesterId || subject.semester?.id.toString() === subjectFilters.semesterId)
      )));
      setNewSubject({ name: '', departmentId: '', semesterId: '', teacherId: '' });
      setError('');
    } catch (err: any) {
      console.error('AdminDashboard: Error adding subject:', err);
      setError(err.message || 'Failed to add subject');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectDelete = async (subjectId: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      setLoading(true);
      const res = await fetchWithAuth(`/api/admin/subjects?subjectId=${subjectId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to delete subject: ${errorData.error || await res.text()}`);
      }
      const updatedSubjects = await fetchWithAuth('/api/admin/subjects').then(res => res.json());
      setSubjects(updatedSubjects);
      setFilteredSubjects(updatedSubjects.filter((subject: Subject) => (
        (!subjectFilters.departmentId || subject.department.id.toString() === subjectFilters.departmentId) &&
        (!subjectFilters.semesterId || subject.semester?.id.toString() === subjectFilters.semesterId)
      )));
      setError('');
    } catch (err: any) {
      console.error('AdminDashboard: Error deleting subject:', err);
      setError(err.message || 'Failed to delete subject');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectEditOpen = (subject: Subject) => {
    setEditSubject(subject);
    setEditSubjectOpen(true);
  };

  const handleSubjectEditClose = () => {
    setEditSubjectOpen(false);
    setEditSubject(null);
  };

  const handleSubjectEditSubmit = async () => {
    if (!editSubject || !editSubject.name) {
      setError('Subject name is required');
      return;
    }
    try {
      setLoading(true);
      const res = await fetchWithAuth(`/api/admin/subjects`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editSubject.id,
          name: editSubject.name,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        let errorMessage = errorData.error || 'Failed to update subject';
        // Map specific API errors to user-friendly messages
        if (errorData.error === 'Subject name already exists in this department') {
          errorMessage = 'A subject with this name already exists in the same department.';
        } else if (errorData.error === 'Subject not found') {
          errorMessage = 'The subject could not be found.';
        } else if (errorData.error === 'Unauthorized') {
          errorMessage = 'You are not authorized to perform this action.';
        }
        throw new Error(errorMessage);
      }
      const { subject: updatedSubject } = await res.json();
      // Update subjects state with the returned subject
      setSubjects((prev) =>
        prev.map((sub) => (sub.id === updatedSubject.id ? updatedSubject : sub))
      );
      // Update filteredSubjects if it matches current filters
      setFilteredSubjects((prev) =>
        prev.map((sub) => (sub.id === updatedSubject.id ? updatedSubject : sub)).filter((subject) =>
          (!subjectFilters.departmentId || subject.department.id.toString() === subjectFilters.departmentId) &&
          (!subjectFilters.semesterId || subject.semester?.id.toString() === subjectFilters.semesterId)
        )
      );
      handleSubjectEditClose();
      setError('');
    } catch (err: any) {
      console.error('AdminDashboard: Error updating subject:', err);
      setError(err.message || 'Failed to update subject');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceDelete = async (recordId: number) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;
    try {
      setLoading(true);
      const res = await fetchWithAuth(`/api/admin/attendance?recordId=${recordId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to delete attendance record: ${errorData.error || await res.text()}`);
      }
      await fetchAttendance();
      setError('');
    } catch (err: any) {
      console.error('AdminDashboard: Error deleting attendance record:', err);
      setError(err.message || 'Failed to delete attendance record');
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

          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ mb: 6 }}
            centered
          >
            <Tab label="Users" />
            <Tab label="Subjects" />
            <Tab label="Attendance" />
            <Tab label="Statistics" />
          </Tabs>

          {tabValue === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* User Management */}
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
                User Filters
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm:3}}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="user-role-select-label">Role</InputLabel>
                      <Select
                        labelId="user-role-select-label"
                        value={userFilters.role}
                        label="Role"
                        onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                      >
                        <MenuItem value="">All Roles</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                        <MenuItem value="TEACHER">Teacher</MenuItem>
                        <MenuItem value="STUDENT">Student</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm:3}}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="user-department-select-label">Department</InputLabel>
                      <Select
                        labelId="user-department-select-label"
                        value={userFilters.departmentId}
                        label="Department"
                        onChange={(e) => setUserFilters({ ...userFilters, departmentId: e.target.value })}
                      >
                        <MenuItem value="">All Departments</MenuItem>
                        {departments.map((dept) => (
                          <MenuItem key={dept.id} value={dept.id.toString()}>{dept.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm:3}}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="user-semester-select-label">Semester</InputLabel>
                      <Select
                        labelId="user-semester-select-label"
                        value={userFilters.semesterId}
                        label="Semester"
                        onChange={(e) => setUserFilters({ ...userFilters, semesterId: e.target.value })}
                      >
                        <MenuItem value="">All Semesters</MenuItem>
                        {semesters.map((sem) => (
                          <MenuItem key={sem.id} value={sem.id.toString()}>{sem.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm:3}}>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUserSearch}
                        disabled={loading}
                        sx={{ py: 2, width: '100%' }}
                      >
                        Search
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

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
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.department?.name || 'N/A'}</TableCell>
                      <TableCell>{user.semester?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleUserDelete(user.id)}
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}

          {tabValue === 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Subject Management */}
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
                Subject Filters
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm:3}}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="subject-filter-department-select-label">Department</InputLabel>
                      <Select
                        labelId="subject-filter-department-select-label"
                        value={subjectFilters.departmentId}
                        label="Department"
                        onChange={(e) => setSubjectFilters({ ...subjectFilters, departmentId: e.target.value })}
                      >
                        <MenuItem value="">All Departments</MenuItem>
                        {departments.map((dept) => (
                          <MenuItem key={dept.id} value={dept.id.toString()}>{dept.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm:3}}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="subject-filter-semester-select-label">Semester</InputLabel>
                      <Select
                        labelId="subject-filter-semester-select-label"
                        value={subjectFilters.semesterId}
                        label="Semester"
                        onChange={(e) => setSubjectFilters({ ...subjectFilters, semesterId: e.target.value })}
                      >
                        <MenuItem value="">All Semesters</MenuItem>
                        {semesters.map((sem) => (
                          <MenuItem key={sem.id} value={sem.id.toString()}>{sem.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm:3}}>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubjectSearch}
                        disabled={loading}
                        sx={{ py: 2, width: '100%' }}
                      >
                        Search
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

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
              <Table sx={{ mb: 8 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell>Teacher</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>{subject.department.name}</TableCell>
                      <TableCell>{subject.semester?.name || 'N/A'}</TableCell>
                      <TableCell>{subject.teacher?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleSubjectEditOpen(subject)}
                          disabled={loading}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleSubjectDelete(subject.id)}
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Dialog open={editSubjectOpen} onClose={handleSubjectEditClose}>
                <DialogTitle>Edit Subject</DialogTitle>
                <DialogContent>
                  <TextField
                    label="Subject Name"
                    value={editSubject?.name || ''}
                    onChange={(e) => setEditSubject({ ...editSubject!, name: e.target.value })}
                    fullWidth
                    margin="normal"
                    required
                    variant="outlined"
                    error={!editSubject?.name && !!error}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleSubjectEditClose} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={handleSubjectEditSubmit} color="primary" disabled={loading}>
                    Save
                  </Button>
                </DialogActions>
              </Dialog>
            </motion.div>
          )}

          {tabValue === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Attendance Management */}
              <Box
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
                  Attendance Filters
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm:3}}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="attendance-department-select-label">Department</InputLabel>
                      <Select
                        labelId="attendance-department-select-label"
                        value={attendanceFilters.departmentId}
                        label="Department"
                        onChange={(e) => setAttendanceFilters({ ...attendanceFilters, departmentId: e.target.value, subjectId: '' })}
                      >
                        <MenuItem value="">All Departments</MenuItem>
                        {departments.map((dept) => (
                          <MenuItem key={dept.id} value={dept.id.toString()}>{dept.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm:3}}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="attendance-semester-select-label">Semester</InputLabel>
                      <Select
                        labelId="attendance-semester-select-label"
                        value={attendanceFilters.semesterId}
                        label="Semester"
                        onChange={(e) => setAttendanceFilters({ ...attendanceFilters, semesterId: e.target.value, subjectId: '' })}
                      >
                        <MenuItem value="">All Semesters</MenuItem>
                        {semesters.map((sem) => (
                          <MenuItem key={sem.id} value={sem.id.toString()}>{sem.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm:3}}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="attendance-subject-select-label">Subject</InputLabel>
                      <Select
                        labelId="attendance-subject-select-label"
                        value={attendanceFilters.subjectId}
                        label="Subject"
                        onChange={(e) => setAttendanceFilters({ ...attendanceFilters, subjectId: e.target.value })}
                      >
                        <MenuItem value="">All Subjects</MenuItem>
                        {subjects
                          .filter((sub) =>
                            (!attendanceFilters.departmentId || sub.department.id.toString() === attendanceFilters.departmentId) &&
                            (!attendanceFilters.semesterId || sub.semester?.id.toString() === attendanceFilters.semesterId)
                          )
                          .map((sub) => (
                            <MenuItem key={sub.id} value={sub.id.toString()}>{sub.name}</MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm:3}}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="attendance-user-select-label">Student</InputLabel>
                      <Select
                        labelId="attendance-user-select-label"
                        value={attendanceFilters.userId}
                        label="Student"
                        onChange={(e) => setAttendanceFilters({ ...attendanceFilters, userId: e.target.value })}
                      >
                        <MenuItem value="">All Students</MenuItem>
                        {users
                          .filter((u) => u.role === 'STUDENT')
                          .map((student) => (
                            <MenuItem key={student.id} value={student.id.toString()}>{student.name}</MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm:3}}>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={fetchAttendance}
                        disabled={loading}
                        sx={{ py: 2, width: '100%' }}
                      >
                        Search
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

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
                Attendance Records
              </Typography>
              <Table sx={{ mb: 8 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell>Teacher</TableCell>
                    <TableCell>Check-In Time</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.student.name}</TableCell>
                      <TableCell>{record.session.subject.name}</TableCell>
                      <TableCell>{record.session.subject.department.name}</TableCell>
                      <TableCell>{record.session.subject.semester?.name || 'N/A'}</TableCell>
                      <TableCell>{record.session.teacher.name}</TableCell>
                      <TableCell>{new Date(record.checkInTime).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleAttendanceDelete(record.id)}
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}

          {tabValue === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* User Statistics */}
              <Box
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
                  Statistics Filters
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm:3}}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="stats-department-select-label">Department</InputLabel>
                      <Select
                        labelId="stats-department-select-label"
                        value={statsFilters.departmentId}
                        label="Department"
                        onChange={(e) => setStatsFilters({ ...statsFilters, departmentId: e.target.value })}
                      >
                        <MenuItem value="">All Departments</MenuItem>
                        {departments.map((dept) => (
                          <MenuItem key={dept.id} value={dept.id.toString()}>{dept.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm:3}}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="stats-semester-select-label">Semester</InputLabel>
                      <Select
                        labelId="stats-semester-select-label"
                        value={statsFilters.semesterId}
                        label="Semester"
                        onChange={(e) => setStatsFilters({ ...statsFilters, semesterId: e.target.value })}
                      >
                        <MenuItem value="">All Semesters</MenuItem>
                        {semesters.map((sem) => (
                          <MenuItem key={sem.id} value={sem.id.toString()}>{sem.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm:3}}>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleStatsSearch}
                        disabled={loading}
                        sx={{ py: 2, width: '100%' }}
                      >
                        Search
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

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
                User Statistics
              </Typography>
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
                }}
              >
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Total Users:</strong> {filteredStats.totalUsers}
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Students by Department and Semester
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell>Semester</TableCell>
                      <TableCell>Student Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStats.usersByDepartmentAndSemester.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell>{stat.department?.name || 'N/A'}</TableCell>
                        <TableCell>{stat.semester?.name || 'N/A'}</TableCell>
                        <TableCell>{stat.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </motion.div>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}