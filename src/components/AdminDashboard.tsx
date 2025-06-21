// components/AdminDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '~/components/Navbar';
import { Container, Box, Typography, Button, TextField, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STUDENT', departmentId: '', semesterId: '' });
  const [newSubject, setNewSubject] = useState({ name: '', departmentId: '', semesterId: '', teacherId: '' });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const usersRes = await fetch('/api/admin/users');
      const subjectsRes = await fetch('/api/admin/subjects');
      const departmentsRes = await fetch('/api/departments');
      const semestersRes = await fetch('/api/semesters');
      setUsers(await usersRes.json());
      setSubjects(await subjectsRes.json());
      setDepartments(await departmentsRes.json());
      setSemesters(await semestersRes.json());
    };
    fetchData();
  }, []);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      const updatedUsers = await fetch('/api/admin/users').then(res => res.json());
      setUsers(updatedUsers);
      setNewUser({ name: '', email: '', password: '', role: 'STUDENT', departmentId: '', semesterId: '' });
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubject),
    });
    if (res.ok) {
      const updatedSubjects = await fetch('/api/admin/subjects').then(res => res.json());
      setSubjects(updatedSubjects);
      setNewSubject({ name: '', departmentId: '', semesterId: '', teacherId: '' });
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" className="py-8">
        <Typography variant="h4" className="mb-6">Admin Dashboard</Typography>
        
        {/* User Management */}
        <Box component="form" onSubmit={handleUserSubmit} className="mb-8 p-4 shadow-lg rounded-lg bg-white">
          <Typography variant="h6" className="mb-4">Add New User</Typography>
          <TextField
            label="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            fullWidth
            margin="dense"
          >
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="TEACHER">Teacher</MenuItem>
            <MenuItem value="STUDENT">Student</MenuItem>
          </Select>
          <Select
            value={newUser.departmentId}
            onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
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
            value={newUser.semesterId}
            onChange={(e) => setNewUser({ ...newUser, semesterId: e.target.value })}
            fullWidth
            margin="dense"
            displayEmpty
          >
            <MenuItem value="">Select Semester</MenuItem>
            {semesters.map((sem: any) => (
              <MenuItem key={sem.id} value={sem.id}>{sem.name}</MenuItem>
            ))}
          </Select>
          <Button type="submit" variant="contained" color="primary" className="mt-4">
            Add User
          </Button>
        </Box>

        {/* Subject Management */}
        <Box component="form" onSubmit={handleSubjectSubmit} className="mb-8 p-4 shadow-lg rounded-lg bg-white">
          <Typography variant="h6" className="mb-4">Add New Subject</Typography>
          <TextField
            label="Subject Name"
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Select
            value={newSubject.departmentId}
            onChange={(e) => setNewSubject({ ...newSubject, departmentId: e.target.value })}
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
            value={newSubject.semesterId}
            onChange={(e) => setNewSubject({ ...newSubject, semesterId: e.target.value })}
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
            value={newSubject.teacherId}
            onChange={(e) => setNewSubject({ ...newSubject, teacherId: e.target.value })}
            fullWidth
            margin="dense"
            displayEmpty
          >
            <MenuItem value="">Select Teacher</MenuItem>
            {users.filter((u: any) => u.role === 'TEACHER').map((teacher: any) => (
              <MenuItem key={teacher.id} value={teacher.id}>{teacher.name}</MenuItem>
            ))}
          </Select>
          <Button type="submit" variant="contained" color="primary" className="mt-4">
            Add Subject
          </Button>
        </Box>

        {/* Users Table */}
        <Typography variant="h6" className="mb-4">Users</Typography>
        <Table>
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
            {users.map((user: any) => (
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

        {/* Subjects Table */}
        <Typography variant="h6" className="my-4">Subjects</Typography>
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
            {subjects.map((subject: any) => (
              <TableRow key={subject.id}>
                <TableCell>{subject.name}</TableCell>
                <TableCell>{subject.department.name}</TableCell>
                <TableCell>{subject.semester?.name || 'N/A'}</TableCell>
                <TableCell>{subject.teacher.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
    </>
  );
}