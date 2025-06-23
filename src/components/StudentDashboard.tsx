'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '~/components/Navbar';
import Geolocation from '~/components/Geolocation';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useRouter } from 'next/navigation';

interface AttendanceSummary {
  subjectId: string;
  subject: { id: string; name: string };
  totalClasses: number;
  attendedClasses: number;
}

interface ActiveSession {
  sessionId: number;
  subjectId: number;
  subject: { id: number; name: string };
  expiresAt: string;
}

interface Semester {
  id: number;
  name: string;
}

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
  const router = useRouter();

  const fetchData = async (semesterId?: number) => {
    try {
      const query = semesterId ? `?semesterId=${semesterId}` : '';
      const [summaryRes, sessionRes, semestersRes] = await Promise.all([
        fetch(`/api/attendance/summary${query}`),
        fetch('/api/attendance/active-session'),
        fetch('/api/semesters'),
      ]);

      // Handle semesters
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

      // Handle attendance summary
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

      // Handle active session
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        setActiveSession(session);
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
    }
  };

  useEffect(() => {
    fetchData(selectedSemesterId || undefined);
    const interval = setInterval(() => fetchData(selectedSemesterId || undefined), 60000); // Refresh every minute
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
      const res = await fetch('/api/attendance/check-in', {
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
      const res = await fetch('/api/attendance/check-out', {
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
    <>
      <Navbar />
      <Geolocation
        onLocationChange={(within: boolean, latitude: number, longitude: number) => {
          setIsWithinRadius(within);
          setLat(latitude);
          setLng(longitude);
        }}
      />
      <Container maxWidth="lg" className="py-8">
        <Typography variant="h4" className="mb-6">
          Student Dashboard
        </Typography>

        {/* Mark Attendance */}
        <Box className="mb-8 p-4 shadow-lg rounded-lg bg-white">
          <Typography variant="h6" className="mb-4">
            Mark Attendance
          </Typography>
          <TextField
            label="Attendance Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
            margin="normal"
            disabled={!isWithinRadius}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckIn}
            className="mt-4 mr-4"
            disabled={!isWithinRadius || !code}
          >
            Check In
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCheckOut}
            className="mt-4"
            disabled={!isWithinRadius || !activeSession?.sessionId}
          >
            Check Out
          </Button>
          {activeSession && timeLeft > 0 && (
            <Typography className="mt-4">
              Active session for {activeSession.subject.name} expires in {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, '0')} minutes
            </Typography>
          )}
          {error && <Typography color="error" className="mt-4">{error}</Typography>}
          {!isWithinRadius && (
            <Typography color="warning" className="mt-4">
              You are outside the geofence
            </Typography>
          )}
        </Box>

        {/* Semester Selector */}
        <Box className="mb-4">
          <FormControl fullWidth>
            <InputLabel id="semester-select-label">Select Semester</InputLabel>
            <Select
              labelId="semester-select-label"
              value={selectedSemesterId}
              label="Select Semester"
              onChange={(e) => setSelectedSemesterId(Number(e.target.value) || '')}
            >
              {semesters.map((semester) => (
                <MenuItem key={semester.id} value={semester.id}>
                  {semester.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Attendance Summary */}
        <Typography variant="h6" className="mb-4">
          Attendance Summary
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Total Classes</TableCell>
              <TableCell>Attended</TableCell>
              <TableCell>Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceSummary.length > 0 ? (
              attendanceSummary.map((summary) => (
                <TableRow key={summary.subjectId}>
                  <TableCell>{summary.subject.name}</TableCell>
                  <TableCell>{summary.totalClasses}</TableCell>
                  <TableCell>{summary.attendedClasses}</TableCell>
                  <TableCell>
                    {summary.totalClasses > 0
                      ? ((summary.attendedClasses / summary.totalClasses) * 100).toFixed(2)
                      : '0.00'}
                    %
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No subjects found for the selected semester
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Container>
    </>
  );
}