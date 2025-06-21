"use client";
import { useState } from "react";
import { trpc } from "~/lib/trpc-client";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";

function GenerateCode() {
  const [departmentId, setDepartmentId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const { data: subjects } = trpc.subject.getSubjects.useQuery();
  const generateCode = trpc.attendance.generateCode.useMutation({
    onSuccess: (data) => {
      setCode(data.code);
      setError("");
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subjectId) {
      generateCode.mutate({ subjectId: Number(subjectId) });
    } else {
      setError("Please select a subject");
    }
  };

  return (
    <div>
      <Typography variant="h6">Generate Attendance Code</Typography>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <FormControl fullWidth>
          <InputLabel>Department</InputLabel>
          <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            {subjects?.map((s) => (
              <MenuItem key={s.department.id} value={s.department.id}>
                {s.department.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Semester</InputLabel>
          <Select value={semesterId} onChange={(e) => setSemesterId(e.target.value)}>
            {subjects?.map((s) => (
              <MenuItem key={s.semester?.id} value={s.semester?.id}>
                {s.semester?.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Subject</InputLabel>
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects?.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" variant="contained">
          Generate Code
        </Button>
        {code && <Typography variant="body1">Code: {code}</Typography>}
      </form>
    </div>
  );
}

function ViewAttendance() {
  const [subjectId, setSubjectId] = useState("");
  const { data: subjects } = trpc.subject.getSubjects.useQuery();
  const { data: logs } = trpc.attendance.getAttendanceLogs.useQuery(
    { subjectId: subjectId ? Number(subjectId) : undefined },
    { enabled: !!subjectId }
  );

  return (
    <div>
      <Typography variant="h6">View Attendance</Typography>
      <FormControl fullWidth className="mb-4">
        <InputLabel>Subject</InputLabel>
        <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          {subjects?.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Student</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Check-In</TableCell>
            <TableCell>Method</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs?.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.student.name}</TableCell>
              <TableCell>{log.session.subject.name}</TableCell>
              <TableCell>{log.checkInTime?.toLocaleString()}</TableCell>
              <TableCell>{log.method}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ManualCheckIn() {
  const [studentId, setStudentId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [method, setMethod] = useState("manual");
  const [error, setError] = useState("");

  const utils = trpc.useContext();
  const { data: users } = trpc.user.getUsers.useQuery();
  const { data: sessions } = trpc.attendance.getSessions.useQuery({}, { enabled: true });
  const manualCheckIn = trpc.attendance.manualCheckIn.useMutation({
    onSuccess: () => {
      utils.attendance.getAttendanceLogs.invalidate();
      setStudentId("");
      setSessionId("");
      setMethod("manual");
      setError("");
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId && sessionId) {
      manualCheckIn.mutate({
        studentId: Number(studentId),
        sessionId: Number(sessionId),
        method,
      });
    } else {
      setError("Please select a student and session");
    }
  };

  return (
    <div>
      <Typography variant="h6">Manual Check-In</Typography>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <FormControl fullWidth>
          <InputLabel>Student</InputLabel>
          <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            {users?.filter((u) => u.role === "STUDENT").map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Session</InputLabel>
          <Select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
            {sessions?.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.subject.name} ({s.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          fullWidth
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" variant="contained">
          Check In
        </Button>
      </form>
    </div>
  );
}

export default function TeacherPage() {
  const [tab, setTab] = useState(0);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Teacher Dashboard
      </Typography>
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
        <Tab label="Generate Code" />
        <Tab label="View Attendance" />
        <Tab label="Manual Check-In" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tab === 0 && <GenerateCode />}
        {tab === 1 && <ViewAttendance />}
        {tab === 2 && <ManualCheckIn />}
      </Box>
    </div>
  );
}