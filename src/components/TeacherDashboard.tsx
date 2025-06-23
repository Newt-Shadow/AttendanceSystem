'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '~/components/Navbar';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  CircularProgress,
  useMediaQuery,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { fetchWithAuth, getCurrentUser } from '../lib/api';
import FunctionsIcon from '@mui/icons-material/Functions';
import ScienceIcon from '@mui/icons-material/Science';
import HistoryIcon from '@mui/icons-material/History';
import BookIcon from '@mui/icons-material/Book';
import LanguageIcon from '@mui/icons-material/Language';
import PaletteIcon from '@mui/icons-material/Palette';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SchoolIcon from '@mui/icons-material/School';
import type { SvgIconComponent } from '@mui/icons-material';

interface Subject {
  id: number;
  name: string;
  departmentId: number;
  semesterId?: number;
  department: { name: string };
  semester?: { name: string };
}

interface Department {
  id: number;
  name: string;
}

interface Semester {
  id: number;
  name: string;
}

interface AttendanceLog {
  id: number;
  student: { name: string };
  session: { subject: { name: string } };
  checkInTime: string;
  checkOutTime?: string;
  method: string;
}

interface SessionResponse {
  code: string;
  id: number;
  expiresAt: string;
}

type SubjectIconKey =
  | 'functions'
  | 'science'
  | 'history'
  | 'book'
  | 'language'
  | 'palette'
  | 'music_note'
  | 'directions_run'
  | 'school';

const getSubjectIcon = (subjectName: string): SubjectIconKey => {
  const lowerName = subjectName.toLowerCase();
  if (lowerName.includes('math')) return 'functions';
  if (lowerName.includes('science')) return 'science';
  if (lowerName.includes('history')) return 'history';
  if (lowerName.includes('literature') || lowerName.includes('english')) return 'book';
  if (lowerName.includes('language')) return 'language';
  if (lowerName.includes('art')) return 'palette';
  if (lowerName.includes('music')) return 'music_note';
  if (lowerName.includes('physical education') || lowerName.includes('pe')) return 'directions_run';
  return 'school';
};

const subjectIconMap: Record<SubjectIconKey, SvgIconComponent> = {
  functions: FunctionsIcon,
  science: ScienceIcon,
  history: HistoryIcon,
  book: BookIcon,
  language: LanguageIcon,
  palette: PaletteIcon,
  music_note: MusicNoteIcon,
  directions_run: DirectionsRunIcon,
  school: SchoolIcon,
};

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
    MuiTable: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255,255,255,0.25)',
          border: '1px solid rgba(255,255,255,0.6)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#0288d1',
          color: '#ffffff',
          fontWeight: 600,
        },
        body: {
          color: '#0d1b2a',
          transition: 'background-color 0.3s ease',
          '&:hover': { backgroundColor: '#e8f0fe' },
        },
      },
    },
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
    MuiTable: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#40c4ff',
          color: '#0a1929',
          fontWeight: 600,
        },
        body: {
          color: '#e6f0fa',
          transition: 'background-color 0.3s ease',
          '&:hover': { backgroundColor: '#3b527a' },
        },
      },
    },
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
  },
});

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [attendanceCode, setAttendanceCode] = useState<string>('');
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [manualAttendance, setManualAttendance] = useState<{ studentId: string; sessionId: string }>({
    studentId: '',
    sessionId: '',
  });
  const [error, setError] = useState<string>('');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const currentTheme = useMemo(() => {
    if (themeMode === 'light') return lightTheme;
    if (themeMode === 'dark') return darkTheme;
    return prefersDarkMode ? darkTheme : lightTheme;
  }, [themeMode, prefersDarkMode]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'TEACHER') {
          setError('Unauthorized access. Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        const [subjectsRes, departmentsRes, semestersRes] = await Promise.all([
          fetchWithAuth(`/api/subjects?teacherId=${user.id}`),
          fetchWithAuth('/api/departments'),
          fetch('/api/semesters'),
        ]);

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

        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);
        setDepartments(await departmentsRes.json());
        setSemesters(await semestersRes.json());

        if (selectedSubject && !subjectsData.some((sub: Subject) => sub.id === parseInt(selectedSubject))) {
          setSelectedSubject('');
          setSelectedSemester('');
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
        setTimeout(() => router.push('/login'), 2000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router, selectedSubject]);

  const generateCode = async () => {
    if (!selectedSubject || !selectedSemester) {
      setError('Please select both a semester and a subject');
      return;
    }
    if (!subjects.some((sub) => sub.id === parseInt(selectedSubject) && sub.semesterId === parseInt(selectedSemester))) {
      setError('Invalid subject or semester selected');
      return;
    }
    try {
      const res = await fetchWithAuth('/api/teacher/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: parseInt(selectedSubject) }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to generate code: ${errorData.error || await res.text()}`);
      }
      const data: { message: string; session: SessionResponse } = await res.json();
      setAttendanceCode(data.session.code);
      setError('');
    } catch (err: any) {
      console.error('Error generating code:', err);
      setError(err.message || 'Failed to generate code');
    }
  };

  const fetchAttendanceLogs = async () => {
    if (!selectedSubject || !selectedSemester) {
      setError('Please select both a semester and a subject');
      return;
    }
    if (!subjects.some((sub) => sub.id === parseInt(selectedSubject) && sub.semesterId === parseInt(selectedSemester))) {
      setError('Invalid subject or semester selected');
      return;
    }
    try {
      const res = await fetchWithAuth(
        `/api/attendance/logs?subjectId=${selectedSubject}&semesterId=${selectedSemester}`
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to fetch logs: ${errorData.error || await res.text()}`);
      }
      const logs = await res.json();
      setAttendanceLogs(logs);
      setError('');
    } catch (err: any) {
      console.error('Error fetching attendance logs:', err);
      setError(err.message || 'Failed to fetch attendance logs');
    }
  };

  const handleManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAttendance.studentId || !manualAttendance.sessionId) {
      setError('Please provide both Student ID and Session ID');
      return;
    }
    try {
      const res = await fetchWithAuth('/api/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: parseInt(manualAttendance.studentId),
          sessionId: parseInt(manualAttendance.sessionId),
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to mark attendance: ${errorData.error || await res.text()}`);
      }
      await fetchAttendanceLogs();
      setManualAttendance({ studentId: '', sessionId: '' });
      setError('');
    } catch (err: any) {
      console.error('Error marking attendance:', err);
      setError(err.message || 'Failed to mark attendance');
    }
  };

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
              Teacher Dashboard
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
                <Alert severity="error" sx={{ mb: 5, borderRadius: '16px' }}>
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box
              sx={{
                mb: 6,
                p: 4,
                borderRadius: 4,
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(8px)',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(255,255,255,0.25)'
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
                Filter Attendance
              </Typography>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="semester-select-label">Select Semester</InputLabel>
                <Select
                  labelId="semester-select-label"
                  value={selectedSemester}
                  onChange={(e) => {
                    setSelectedSemester(e.target.value as string);
                    setSelectedSubject('');
                  }}
                  label="Select Semester"
                  error={!!error && error.includes('semester')}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">Select Semester</MenuItem>
                  {semesters.map((sem) => (
                    <MenuItem key={sem.id} value={sem.id.toString()}>
                      {sem.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="department-select-label">Select Department</InputLabel>
                <Select
                  labelId="department-select-label"
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value as string);
                    setSelectedSubject('');
                  }}
                  label="Select Department"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="subject-select-label">Select Subject</InputLabel>
                <Select
                  labelId="subject-select-label"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value as string)}
                  label="Select Subject"
                  error={!!error && error.includes('subject')}
                  disabled={!selectedSemester}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">Select Subject</MenuItem>
                  {subjects
                    .filter(
                      (sub) =>
                        (!selectedDepartment || sub.departmentId === parseInt(selectedDepartment)) &&
                        (!selectedSemester || sub.semesterId === parseInt(selectedSemester))
                    )
                    .map((sub) => (
                      <MenuItem key={sub.id} value={sub.id.toString()}>
                        {sub.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <Box sx={{ mt: 4, display: 'flex', gap: 4, justifyContent: 'center' }}>
                <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'inline-block', marginRight: 16 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={generateCode}
                    disabled={!selectedSubject || !selectedSemester}
                    sx={{ px: 6, py: 2 }}
                  >
                    Generate Code
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'inline-block' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={fetchAttendanceLogs}
                    disabled={!selectedSubject || !selectedSemester}
                    sx={{ px: 6, py: 2 }}
                  >
                    Fetch Attendance Logs
                  </Button>
                </motion.div>
              </Box>
              {attendanceCode && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Alert
                    severity="success"
                    sx={{
                      mt: 5,
                      borderRadius: '16px',
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      fontWeight: 500,
                    }}
                  >
                    Generated Attendance Code: <span style={{ textDecoration: 'underline' }}>{attendanceCode}</span>
                  </Alert>
                </motion.div>
              )}
            </Box>
          </motion.div>

          {/* Manual Attendance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Box
              component="form"
              onSubmit={handleManualAttendance}
              sx={{
                mb: 6,
                p: 4,
                borderRadius: 4,
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(8px)',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(255,255,255,0.25)'
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
                Manual Attendance
              </Typography>
              <TextField
                label="Student ID"
                value={manualAttendance.studentId}
                onChange={(e) => setManualAttendance({ ...manualAttendance, studentId: e.target.value })}
                fullWidth
                margin="normal"
                type="number"
                InputProps={{ sx: { borderRadius: '12px', bgcolor: 'background.default' } }}
              />
              <TextField
                label="Session ID"
                value={manualAttendance.sessionId}
                onChange={(e) => setManualAttendance({ ...manualAttendance, sessionId: e.target.value })}
                fullWidth
                margin="normal"
                type="number"
                InputProps={{ sx: { borderRadius: '12px', bgcolor: 'background.default' } }}
              />
              <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'inline-block' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 4, px: 6, py: 2 }}
                >
                  Mark Attendance
                </Button>
              </motion.div>
            </Box>
          </motion.div>

          {/* Attendance Logs */}
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
              Attendance Logs
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <CircularProgress size={70} thickness={4.5} />
                </motion.div>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Check-In</TableCell>
                    <TableCell>Check-Out</TableCell>
                    <TableCell>Method</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceLogs.length > 0 ? (
                    attendanceLogs.map((log) => {
                      const IconComponent = subjectIconMap[getSubjectIcon(log.session.subject.name)] || SchoolIcon;
                      return (
                        <TableRow key={log.id}>
                          <TableCell>{log.student.name}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconComponent sx={{ color: 'primary.main' }} />
                              {log.session.subject.name}
                            </Box>
                          </TableCell>
                          <TableCell>{new Date(log.checkInTime).toLocaleString()}</TableCell>
                          <TableCell>{log.checkOutTime ? new Date(log.checkOutTime).toLocaleString() : 'N/A'}</TableCell>
                          <TableCell>{log.method}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography
                          color="text.secondary"
                          sx={{ py: 6, fontStyle: 'italic', fontSize: '1.2rem' }}
                        >
                          No attendance logs found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  );
}