// components/TeacherDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '~/components/Navbar';
import { Container, Box, Typography, Button, TextField, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [attendanceCode, setAttendanceCode] = useState('');
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [manualAttendance, setManualAttendance] = useState({ studentId: '', sessionId: '' });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) throw new Error('Failed to fetch user');
        const user = await userRes.json();
        const subjectsRes = await fetch(`/api/subjects?teacherId=${user.id}`);
        const departmentsRes = await fetch('/api/departments');
        const semestersRes = await fetch('/api/semesters');
        if (!subjectsRes.ok || !departmentsRes.ok || !semestersRes.ok) {
          throw new Error('Failed to fetch data');
        }
        setSubjects(await subjectsRes.json());
        setDepartments(await departmentsRes.json());
        setSemesters(await semestersRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/login'); // Redirect to login on error
      }
    };
    fetchData();
  }, [router]);

  const generateCode = async () => {
    if (!selectedSubject) return;
    try {
      const res = await fetch('/api/teacher/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: selectedSubject }),
      });
      if (!res.ok) throw new Error('Failed to generate code');
      const data = await res.json();
      setAttendanceCode(data.code);
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };

  const fetchAttendanceLogs = async () => {
    if (!selectedSubject) return;
    try {
      const res = await fetch(`/api/attendance/logs?subjectId=${selectedSubject}`);
      if (!res.ok) throw new Error('Failed to fetch attendance logs');
      setAttendanceLogs(await res.json());
    } catch (error) {
      console.error('Error fetching attendance logs:', error);
    }
  };

  const handleManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualAttendance),
      });
      if (!res.ok) throw new Error('Failed to mark attendance');
      await fetchAttendanceLogs();
      setManualAttendance({ studentId: '', sessionId: '' });
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" className="py-8">
        <Typography variant="h4" className="mb-6">Teacher Dashboard</Typography>

        {/* Filters */}
        <Box className="mb-8 p-4 shadow-lg rounded-lg bg-white">
          <Typography variant="h6" className="mb-4">Generate Attendance Code</Typography>
          <Select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            fullWidth
            margin="dense"
            displayEmpty
          >
            <MenuItem value="">Select Department</MenuItem>
            {departments.map((dept: any) => (
              <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
            ))}
          </Select>
          <Select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            fullWidth
            margin="dense"
            displayEmpty
          >
            <MenuItem value="">Select Semester</MenuItem>
            {semesters.map((sem: any) => (
              <MenuItem key={sem.id} value={sem.id}>{sem.name}</MenuItem>
            ))}
          </Select>
          <Select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            fullWidth
            margin="dense"
            displayEmpty
          >
            <MenuItem value="">Select Subject</MenuItem>
            {subjects
              .filter((sub: any) => 
                (!selectedDepartment || sub.departmentId === selectedDepartment) &&
                (!selectedSemester || sub.semesterId === selectedSemester)
              )
              .map((sub: any) => (
                <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
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
            <Typography variant="h6" className="mt-4">
              Attendance Code: {attendanceCode}
            </Typography>
          )}
        </Box>

        {/* Manual Attendance */}
        <Box component="form" onSubmit={handleManualAttendance} className="mb-8 p-4 shadow-lg rounded-lg bg-white">
          <Typography variant="h6" className="mb-4">Manual Attendance</Typography>
          <TextField
            label="Student ID"
            value={manualAttendance.studentId}
            onChange={(e) => setManualAttendance({ ...manualAttendance, studentId: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Session ID"
            value={manualAttendance.sessionId}
            onChange={(e) => setManualAttendance({ ...manualAttendance, sessionId: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" className="mt-4">
            Mark Attendance
          </Button>
        </Box>

        {/* Attendance Logs */}
        <Typography variant="h6" className="mb-4">Attendance Logs</Typography>
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
            {attendanceLogs.map((log: any) => (
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