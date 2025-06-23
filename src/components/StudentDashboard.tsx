// StudentDashboard.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '~/components/Navbar';
import Geolocation from '~/components/Geolocation';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  useMediaQuery,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '~/lib/api';
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

interface AttendanceSummary {
  subjectId: string;
  subject: { id: string; name: string };
  totalClasses: number;
  attendedClasses: number;
}

interface ActiveSession {
  sessionId: number;
  subjectId: number;
  subject: { id: number; name: number };
  expiresAt: string;
}

interface Semester {
  id: number;
  name: string;
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

export default function StudentDashboard() {
  const [code, setCode] = useState('');
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [error, setError] = useState('');
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | ''>('');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const currentTheme = useMemo(() => {
    if (themeMode === 'light') return lightTheme;
    if (themeMode === 'dark') return darkTheme;
    return prefersDarkMode ? darkTheme : lightTheme;
  }, [themeMode, prefersDarkMode]);

  const fetchData = async (semesterId?: number) => {
    setIsLoading(true);
    try {
      const query = semesterId ? `?semesterId=${semesterId}` : '';
      const [summaryRes, sessionRes, semestersRes] = await Promise.all([
        fetchWithAuth(`/api/attendance/summary${query}`),
        fetchWithAuth('/api/attendance/active-session'),
        fetch('/api/semesters'),
      ]);

      if (semestersRes.ok) {
        const semestersData = await semestersRes.json();
        if (Array.isArray(semestersData)) {
          setSemesters(semestersData);
          if (!selectedSemesterId && semestersData.length > 0) {
            setSelectedSemesterId(semestersData[0].id);
          }
        } else {
          setError('Invalid semesters data');
        }
      } else {
        setError('Failed to fetch semesters');
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        if (Array.isArray(summaryData)) {
          setAttendanceSummary(summaryData);
        } else {
          setError('Invalid attendance summary data');
        }
      } else {
        throw new Error('Failed to fetch attendance summary');
      }

      if (sessionRes.ok) {
        const session = await sessionRes.json();
        setActiveSession(session.sessionId ? session : null);
        if (session?.expiresAt) {
          const expires = new Date(session.expiresAt).getTime();
          setTimeLeft(Math.max(0, Math.floor((expires - Date.now()) / 1000)));
        }
      } else {
        setActiveSession(null);
        setTimeLeft(0);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedSemesterId || undefined);
    const interval = setInterval(() => fetchData(selectedSemesterId || undefined), 60000);
    return () => clearInterval(interval);
  }, [selectedSemesterId]);

  useEffect(() => {
    if (activeSession?.expiresAt) {
      const timer = setInterval(() => {
        const expires = new Date(activeSession.expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expires - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          setActiveSession(null);
          fetchData(selectedSemesterId || undefined);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeSession, selectedSemesterId]);

  const handleCheckIn = async () => {
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      if (!ipRes.ok) throw new Error('Failed to fetch IP');
      const { ip } = await ipRes.json();
      const res = await fetchWithAuth('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, lat, lng, ip }),
      });
      const data = await res.json();
      if (res.ok) {
        setCode('');
        setError('');
        await fetchData(selectedSemesterId || undefined);
      } else {
        setError(data.error || 'Failed to check in');
      }
    } catch {
      setError('An error occurred during check-in');
    }
  };

  const handleCheckOut = async () => {
    if (!activeSession?.sessionId) {
      setError('No active session to check out from');
      return;
    }
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      if (!ipRes.ok) throw new Error('Failed to fetch IP');
      const { ip } = await ipRes.json();
      const res = await fetchWithAuth('/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession.sessionId, lat, lng, ip }),
      });
      const data = await res.json();
      if (res.ok) {
        setError('');
        setActiveSession(null);
        setTimeLeft(0);
        await fetchData(selectedSemesterId || undefined);
      } else {
        setError(data.error || 'Failed to check out');
      }
    } catch {
      setError('An error occurred during check-out');
    }
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <Navbar themeMode={themeMode} setThemeMode={setThemeMode} />
      <Geolocation
        onLocationChange={(within: boolean, latitude: number, longitude: number) => {
          setIsWithinRadius(within);
          setLat(latitude);
          setLng(longitude);
        }}
      />
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
              Student Dashboard
            </Typography>
          </motion.div>

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
                Mark Attendance
              </Typography>
              <TextField
                label="Attendance Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                fullWidth
                margin="normal"
                disabled={!isWithinRadius}
                variant="outlined"
                InputProps={{ sx: { borderRadius: '16px', bgcolor: 'background.default' } }}
              />
              <Box sx={{ mt: 4, display: 'flex', gap: 4, justifyContent: 'center' }}>
                <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'inline-block', marginRight: 16 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCheckIn}
                    disabled={!isWithinRadius || !code}
                    sx={{ px: 6, py: 2 }}
                  >
                    Check In
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'inline-block' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleCheckOut}
                    disabled={!isWithinRadius || !activeSession?.sessionId}
                    sx={{ px: 6, py: 2 }}
                  >
                    Check Out
                  </Button>
                </motion.div>
              </Box>
              <AnimatePresence>
                {activeSession && timeLeft > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Alert
                      severity="info"
                      sx={{
                        mt: 5,
                        borderRadius: '16px',
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        fontWeight: 500,
                      }}
                    >
                      Active session for {activeSession.subject.name} expires in{' '}
                      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} minutes
                    </Alert>
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Alert severity="error" sx={{ mt: 5, borderRadius: '16px' }}>
                      {error}
                    </Alert>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Alert severity={isWithinRadius ? 'success' : 'warning'} sx={{ mt: 5, borderRadius: '16px' }}>
                    {isWithinRadius ? 'You are within the geofence' : 'You are outside the geofence'}
                  </Alert>
                </motion.div>
              </AnimatePresence>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Box sx={{ mb: 6, maxWidth: 400, mx: 'auto' }}>
              <FormControl fullWidth>
                <InputLabel id="semester-select-label">Select Semester</InputLabel>
                <Select
                  labelId="semester-select-label"
                  value={selectedSemesterId}
                  label="Select Semester"
                  onChange={(e) => setSelectedSemesterId(Number(e.target.value) || '')}
                  sx={{ borderRadius: '12px' }}
                >
                  {semesters.map((semester) => (
                    <MenuItem key={semester.id} value={semester.id}>
                      {semester.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </motion.div>

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
              Attendance Summary
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={70} thickness={4.5} />
              </Box>
            ) : (
              <Grid container spacing={4}>
                {attendanceSummary.length > 0 ? (
                  attendanceSummary.map((summary) => {
                    const IconComponent = subjectIconMap[getSubjectIcon(summary.subject.name)] || SchoolIcon;
                    return (
                      <Grid component="div" size={{ xs: 12 ,sm:6, md:4}} key={summary.subjectId}>
                        <motion.div whileHover={{ scale: 1.04 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
                          <Card
                            sx={{
                              borderRadius: '20px',
                              boxShadow: (theme) =>
                                theme.palette.mode === 'light'
                                  ? '0 8px 32px rgba(0,0,0,0.1)'
                                  : '0 8px 32px rgba(0,0,0,0.3)',
                              backdropFilter: 'blur(8px)',
                              backgroundColor: (theme) =>
                                theme.palette.mode === 'light'
                                  ? 'rgba(255,255,255,0.25)'
                                  : 'rgba(255,255,255,0.1)',
                              border: (theme) =>
                                theme.palette.mode === 'light'
                                  ? '1px solid rgba(255,255,255,0.6)'
                                  : '1px solid rgba(255,255,255,0.2)',
                            }}
                          >
                            <CardHeader
                              avatar={
                                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                  <IconComponent fontSize="large" />
                                </Avatar>
                              }
                              title={summary.subject.name}
                              subheader={`Attended: ${summary.attendedClasses} / ${summary.totalClasses}`}
                              titleTypographyProps={{ variant: 'h6', fontWeight: 'medium' }}
                              subheaderTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            />
                            <CardContent>
                              <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                                Attendance:{' '}
                                {summary.totalClasses > 0
                                  ? ((summary.attendedClasses / summary.totalClasses) * 100).toFixed(2)
                                  : '0.00'}
                                %
                              </Typography>
                              <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.2, ease: 'easeOut' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={
                                    summary.totalClasses > 0
                                      ? (summary.attendedClasses / summary.totalClasses) * 100
                                      : 0
                                  }
                                  sx={{
                                    height: 12,
                                    borderRadius: 6,
                                    bgcolor: 'grey.300',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor:
                                        summary.attendedClasses / summary.totalClasses < 0.75
                                          ? 'error.main'
                                          : 'primary.main',
                                      transition: 'width 0.6s ease-in-out',
                                    },
                                  }}
                                />
                              </motion.div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    );
                  })
                ) : (
                  <Grid component="div" size={{ xs: 12 }}>
                    <Typography color="text.secondary" align="center" sx={{ py: 6, fontStyle: 'italic', fontSize: '1.2rem' }}>
                      No subjects found for the selected semester
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
