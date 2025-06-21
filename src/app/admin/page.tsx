
"use client";
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
    <div className="tab-content">
      <h2 className="subheader">Manage Users</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="input-container">
          <input
            type="text"
            id="user-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder=" "
          />
          <label htmlFor="user-name" className="input-label">
            Name
          </label>
        </div>
        <div className="input-container">
          <input
            type="email"
            id="user-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder=" "
          />
          <label htmlFor="user-email" className="input-label">
            Email
          </label>
        </div>
        <div className="input-container">
          <input
            type="password"
            id="user-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder=" "
          />
          <label htmlFor="user-password" className="input-label">
            Password
          </label>
        </div>
        <div className="input-container">
          <select
            id="user-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-field"
          >
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
          </select>
          <label htmlFor="user-role" className="input-label">
            Role
          </label>
        </div>
        <div className="input-container">
          <input
            type="text"
            id="user-department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="input-field"
            placeholder=" "
          />
          <label htmlFor="user-department" className="input-label">
            Department ID
          </label>
        </div>
        <div className="input-container">
          <input
            type="text"
            id="user-semester"
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
            className="input-field"
            placeholder=" "
          />
          <label htmlFor="user-semester" className="input-label">
            Semester ID
          </label>
        </div>
        <button type="submit" className="submit-button">
          Create User
        </button>
      </form>
      <table className="table">
        <thead className="table-head">
          <tr>
            <th className="table-head-cell">Name</th>
            <th className="table-head-cell">Email</th>
            <th className="table-head-cell">Role</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.id} className="table-row">
              <td className="table-body-cell">{user.name}</td>
              <td className="table-body-cell">{user.email}</td>
              <td className="table-body-cell">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
    <div className="tab-content">
      <h2 className="subheader">Manage Subjects</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="input-container">
          <input
            type="text"
            id="subject-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder=" "
          />
          <label htmlFor="subject-name" className="input-label">
            Name
          </label>
        </div>
        <div className="input-container">
          <input
            type="text"
            id="subject-department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="input-field"
            placeholder=" "
          />
          <label htmlFor="subject-department" className="input-label">
            Department ID
          </label>
        </div>
        <div className="input-container">
          <input
            type="text"
            id="subject-semester"
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
            className="input-field"
            placeholder=" "
          />
          <label htmlFor="subject-semester" className="input-label">
            Semester ID
          </label>
        </div>
        <div className="input-container">
          <input
            type="text"
            id="subject-teacher"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="input-field"
            placeholder=" "
          />
          <label htmlFor="subject-teacher" className="input-label">
            Teacher ID
          </label>
        </div>
        <button type="submit" className="submit-button">
          Create Subject
        </button>
      </form>
      <table className="table">
        <thead className="table-head">
          <tr>
            <th className="table-head-cell">Name</th>
            <th className="table-head-cell">Department</th>
            <th className="table-head-cell">Teacher</th>
          </tr>
        </thead>
        <tbody>
          {subjects?.map((subject) => (
            <tr key={subject.id} className="table-row">
              <td className="table-body-cell">{subject.name}</td>
              <td className="table-body-cell">{subject.department.name}</td>
              <td className="table-body-cell">{subject.teacher.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <style jsx>{`
        .container {
          font-family: 'Roboto', sans-serif;
          color: rgba(0, 0, 0, 0.87);
        }

        .header {
          font-size: 2.125rem;
          font-weight: 400;
          margin-bottom: 16px;
        }

        .tabs {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
        }

        .tab {
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.87);
          padding: 12px 16px;
          border: none;
          background: none;
          cursor: pointer;
          transition: color 0.2s;
        }

        .tab.active {
          color: #1976d2;
          border-bottom: 2px solid #1976d2;
        }

        .tab:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }

        .tab-content {
          margin-top: 16px;
        }

        .subheader {
          font-size: 1.25rem;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .input-container {
          position: relative;
          width: 100%;
        }

        .input-field {
          width: 100%;
          padding: 18.5px 14px;
          font-size: 16px;
          line-height: 1.5;
          border: 1px solid #c4c4c4;
          border-radius: 4px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input-field:focus {
          border: 2px solid #1976d2;
          box-shadow: 0 0 0 1px #1976d2;
        }

        .input-field:not(:placeholder-shown) + .input-label,
        .input-field:focus + .input-label {
          top: 0;
          font-size: 12px;
          color: #1976d2;
        }

        .input-label {
          position: absolute;
          top: 50%;
          left: 14px;
          transform: translateY(-50%);
          font-size: 16px;
          color: #616161;
          pointer-events: none;
          transition: all 0.2s;
          background: white;
          padding: 0 4px;
        }

        select.input-field {
          appearance: none;
          background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23616161" d="M7 10l5 5 5-5z"/></svg>') no-repeat right 14px center;
        }

        .submit-button {
          width: 100%;
          padding: 6px 16px;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          color: white;
          background-color: #1976d2;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .submit-button:hover {
          background-color: #1565c0;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          margin-top: 16px;
        }

        .table-head {
          font-weight: 700;
          color: rgba(0, 0, 0, 0.87);
        }

        .table-head-cell {
          padding: 16px;
          border-bottom: 1px solid #e0e0e0;
          text-align: left;
        }

        .table-body-cell {
          padding: 16px;
          border-bottom: 1px solid #e0e0e0;
          text-align: left;
        }

        .table-row:hover {
          background-color: #f5f5f5;
        }
      `}</style>
      <div className="container">
        <h1 className="header">Admin Dashboard</h1>
        <div className="tabs">
          <button className={`tab ${tab === 0 ? 'active' : ''}`} onClick={() => setTab(0)}>
            Users
          </button>
          <button className={`tab ${tab === 1 ? 'active' : ''}`} onClick={() => setTab(1)}>
            Subjects
          </button>
        </div>
        <div className="tab-content">
          {tab === 0 && <UsersTab />}
          {tab === 1 && <SubjectsTab />}
        </div>
      </div>
    </>
  );
}
