import {
  Typography,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useState } from "react";
import { trpc } from "~/lib/trpc-client";


function UsersTab() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [departmentId, setDepartmentId] = useState("");
  const [semesterId, setSemesterId] = useState("");

  const utils = trpc.useContext();
  const { data: users } = trpc.user.getUsers.useQuery();
  const createUser = trpc.user.createUser.useMutation({
    onSuccess: () => utils.user.getUsers.invalidate(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate({
      name,
      email,
      password,
      role: role as "ADMIN" | "TEACHER" | "STUDENT",
      departmentId: departmentId ? Number(departmentId) : undefined,
      semesterId: semesterId ? Number(semesterId) : undefined,
    });
  };

  return (
    <div>
      <Typography variant="h6">Manage Users</Typography>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="TEACHER">Teacher</MenuItem>
            <MenuItem value="STUDENT">Student</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Department ID"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          fullWidth
        />
        <TextField
          label="Semester ID"
          value={semesterId}
          onChange={(e) => setSemesterId(e.target.value)}
          fullWidth
        />
        <Button type="submit" variant="contained">
          Create User
        </Button>
      </form>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SubjectsTab() {
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const utils = trpc.useContext();
  const { data: subjects } = trpc.subject.getSubjects.useQuery();
  const createSubject = trpc.subject.createSubject.useMutation({
    onSuccess: () => utils.subject.getSubjects.invalidate(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSubject.mutate({
      name,
      departmentId: Number(departmentId),
      semesterId: semesterId ? Number(semesterId) : undefined,
      teacherId: Number(teacherId),
    });
  };

  return (
    <div>
      <Typography variant="h6">Manage Subjects</Typography>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
        <TextField
          label="Department ID"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          fullWidth
        />
        <TextField
          label="Semester ID"
          value={semesterId}
          onChange={(e) => setSemesterId(e.target.value)}
          fullWidth
        />
        <TextField
          label="Teacher ID"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          fullWidth
        />
        <Button type="submit" variant="contained">
          Create Subject
        </Button>
      </form>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Teacher</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subjects?.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell>{subject.name}</TableCell>
              <TableCell>{subject.department.name}</TableCell>
              <TableCell>{subject.teacher.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState(0);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
        <Tab label="Users" />
        <Tab label="Subjects" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tab === 0 && <UsersTab />}
        {tab === 1 && <SubjectsTab />}
      </Box>
    </div>
  );
}