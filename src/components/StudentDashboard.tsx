// components/StudentDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '~/components/Navbar';
import  Geolocation  from '~/components/Geolocation';
import { Container, Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
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
}

export default function StudentDashboard() {
  const [code, setCode] = useState('');
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [error, setError] = useState('');
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [summaryRes, sessionRes] = await Promise.all([
        fetch('/api/attendance/summary'),
        fetch('/api/attendance/active-session'),
      ]);
      if (!summaryRes.ok) throw new Error('Failed to fetch attendance summary');
      setAttendanceSummary(await summaryRes.json());
      if (sessionRes.ok) {
        setActiveSession(await sessionRes.json());
      } else {
        setActiveSession(null); // No active session
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        await fetchData(); // Refresh summary and active session
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
        setActiveSession(null); // Clear active session
        await fetchData(); // Refresh summary
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
        <Typography variant="h4" className="mb-6">Student Dashboard</Typography>

        {/* Mark Attendance */}
        <Box className="mb-8 p-4 shadow-lg rounded-lg bg-white">
          <Typography variant="h6" className="mb-4">Mark Attendance</Typography>
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
          {error && <Typography color="error" className="mt-4">{error}</Typography>}
          {!isWithinRadius && <Typography color="warning" className="mt-4">You are outside the geofence</Typography>}
        </Box>

        {/* Attendance Summary */}
        <Typography variant="h6" className="mb-4">Attendance Summary</Typography>
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
            {attendanceSummary.map((summary) => (
              <TableRow key={summary.subjectId}>
                <TableCell>{summary.subject.name}</TableCell>
                <TableCell>{summary.totalClasses}</TableCell>
                <TableCell>{summary.attendedClasses}</TableCell>
                <TableCell>
                  {summary.totalClasses > 0
                    ? ((summary.attendedClasses / summary.totalClasses) * 100).toFixed(2)
                    : '0.00'}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
    </>
  );
}