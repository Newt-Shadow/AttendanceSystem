// src/components/TeacherDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '~/components/Navbar';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) {
          const text = await userRes.text();
          console.error('Auth response:', text);
          throw new Error('Failed to fetch user');
        }
        const user = await userRes.json();
        console.log('User:', user);

        const subjectsRes = await fetch('/api/subjects');
        const departmentsRes = await fetch('/api/departments');
        const semestersRes = await fetch('/api/semesters');

        if (!subjectsRes.ok) throw new Error(`Subjects fetch failed: ${await subjectsRes.text()}`);
        if (!departmentsRes.ok) throw new Error(`Departments fetch failed: ${await departmentsRes.text()}`);
        if (!semestersRes.ok) throw new Error(`Semesters fetch failed: ${await semestersRes.text()}`);

        setSubjects(await subjectsRes.json());
        setDepartments(await departmentsRes.json());
        setSemesters(await semestersRes.json());
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
        router.push('/login');
      }
    };
    fetchData();
  }, [router]);

  const generateCode = async () => {
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }
    try {
      const res = await fetch('/api/teacher/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: parseInt(selectedSubject) }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('POST /api/teacher/generate-code response:', text);
        try {
          const data = JSON.parse(text);
          throw new Error(data.error || 'Failed to generate code');
        } catch {
          throw new Error('Invalid JSON response: ' + text);
        }
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
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }
    try {
      const res = await fetch(`/api/attendance/logs?subjectId=${selectedSubject}`);
      if (!res.ok) throw new Error(`Failed to fetch logs: ${await res.text()}`);
      setAttendanceLogs(await res.json());
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
      const res = await fetch('/api/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: parseInt(manualAttendance.studentId),
          sessionId: parseInt(manualAttendance.sessionId),
        }),
      });
      if (!res.ok) throw new Error(`Failed to mark attendance: ${await res.text()}`);
      await fetchAttendanceLogs();
      setManualAttendance({ studentId: '', sessionId: '' });
      setError('');
    } catch (err: any) {
      console.error('Error marking attendance:', err);
      setError(err.message || 'Failed to mark attendance');
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" className="py-8">
        <Typography variant="h4" className="mb-6">
          Teacher Dashboard
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Box className="mb-8 p-4 shadow-lg rounded-lg bg-white">
          <Typography variant="h6" className="mb-4">
            Generate Attendance Code
          </Typography>
          <Select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value as string)}
            fullWidth
            margin="dense"
            displayEmpty
          >
            <MenuItem value="">All Departments</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value as string)}
            fullWidth
            margin="dense"
            displayEmpty
          >
            <MenuItem value="">All Semesters</MenuItem>
            {semesters.map((sem) => (
              <MenuItem key={sem.id} value={sem.id.toString()}>
                {sem.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as string)}
            fullWidth
            margin="dense"
            displayEmpty
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
          <Button
            variant="contained"
            color="primary"
            onClick={generateCode}
            className="mt-4"
            disabled={!selectedSubject}
          >
            Generate Code
          </Button>
          {attendanceCode && (
            <Typography variant="h6" className="mt-4 text-green-600 font-bold">
              Generated Attendance Code: <span className="underline">{attendanceCode}</span>
            </Typography>
          )}
        </Box>

        {/* Manual Attendance */}
        <Box component="form" onSubmit={handleManualAttendance} className="mb-8 p-4 shadow-lg rounded-lg bg-white">
          <Typography variant="h6" className="mb-4">
            Manual Attendance
          </Typography>
          <TextField
            label="Student ID"
            value={manualAttendance.studentId}
            onChange={(e) => setManualAttendance({ ...manualAttendance, studentId: e.target.value })}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Session ID"
            value={manualAttendance.sessionId}
            onChange={(e) => setManualAttendance({ ...manualAttendance, sessionId: e.target.value })}
            fullWidth
            margin="normal"
            type="number"
          />
          <Button type="submit" variant="contained" color="primary" className="mt-4">
            Mark Attendance
          </Button>
        </Box>

        {/* Attendance Logs */}
        <Typography variant="h6" className="mb-4">
          Attendance Logs
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchAttendanceLogs}
          className="mb-4"
          disabled={!selectedSubject}
        >
          Fetch Logs
        </Button>
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
            {attendanceLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.student.name}</TableCell>
                <TableCell>{log.session.subject.name}</TableCell>
                <TableCell>{new Date(log.checkInTime).toLocaleString()}</TableCell>
                <TableCell>{log.checkOutTime ? new Date(log.checkOutTime).toLocaleString() : 'N/A'}</TableCell>
                <TableCell>{log.method}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
    </>
  );
}