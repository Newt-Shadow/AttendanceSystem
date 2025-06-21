"use client";
import { useState } from "react";
import { trpc } from "~/lib/trpc-client";

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
    <div className="tab-content">
      <h2 className="subheader">Generate Attendance Code</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="input-container">
          <select
            id="department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="input-field"
          >
            <option value="">Select Department</option>
            {subjects?.map((s) => (
              <option key={s.department.id} value={s.department.id}>
                {s.department.name}
              </option>
            ))}
          </select>
          <label htmlFor="department" className="input-label">
            Department
          </label>
        </div>
        <div className="input-container">
          <select
            id="semester"
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
            className="input-field"
          >
            <option value="">Select Semester</option>
            {subjects?.map((s) => (
              s.semester && (
                <option key={s.semester.id} value={s.semester.id}>
                  {s.semester.name}
                </option>
              )
            ))}
          </select>
          <label htmlFor="semester" className="input-label">
            Semester
          </label>
        </div>
        <div className="input-container">
          <select
            id="subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="input-field"
          >
            <option value="">Select Subject</option>
            {subjects?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <label htmlFor="subject" className="input-label">
            Subject
          </label>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="submit-button">
          Generate Code
        </button>
        {code && <p className="body-text">Code: {code}</p>}
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
    <div className="tab-content">
      <h2 className="subheader">View Attendance</h2>
      <div className="input-container mb-4">
        <select
          id="view-subject"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="input-field"
        >
          <option value="">Select Subject</option>
          {subjects?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <label htmlFor="view-subject" className="input-label">
          Subject
        </label>
      </div>
      <table className="table">
        <thead className="table-head">
          <tr>
            <th className="table-head-cell">Student</th>
            <th className="table-head-cell">Subject</th>
            <th className="table-head-cell">Check-In</th>
            <th className="table-head-cell">Method</th>
          </tr>
        </thead>
        <tbody>
          {logs?.map((log) => (
            <tr key={log.id} className="table-row">
              <td className="table-body-cell">{log.student.name}</td>
              <td className="table-body-cell">{log.session.subject.name}</td>
              <td className="table-body-cell">{log.checkInTime?.toLocaleString()}</td>
              <td className="table-body-cell">{log.method}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
    <div className="tab-content">
      <h2 className="subheader">Manual Check-In</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="input-container">
          <select
            id="student"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="input-field"
          >
            <option value="">Select Student</option>
            {users?.filter((u) => u.role === "STUDENT").map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <label htmlFor="student" className="input-label">
            Student
          </label>
        </div>
        <div className="input-container">
          <select
            id="session"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="input-field"
          >
            <option value="">Select Session</option>
            {sessions?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subject.name} ({s.code})
              </option>
            ))}
          </select>
          <label htmlFor="session" className="input-label">
            Session
          </label>
        </div>
        <div className="input-container">
          <input
            type="text"
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="input-field"
            placeholder=" "
          />
          <label htmlFor="method" className="input-label">
            Method
          </label>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="submit-button">
          Check In
        </button>
      </form>
    </div>
  );
}

export default function TeacherPage() {
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

        .body-text {
          font-size: 1rem;
          font-weight: 400;
          margin-top: 16px;
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

        .mb-4 {
          margin-bottom: 16px;
        }
      `}</style>
      <div className="container">
        <h1 className="header">Teacher Dashboard</h1>
        <div className="tabs">
          <button className={`tab ${tab === 0 ? 'active' : ''}`} onClick={() => setTab(0)}>
            Generate Code
          </button>
          <button className={`tab ${tab === 1 ? 'active' : ''}`} onClick={() => setTab(1)}>
            View Attendance
          </button>
          <button className={`tab ${tab === 2 ? 'active' : ''}`} onClick={() => setTab(2)}>
            Manual Check-In
          </button>
        </div>
        <div className="tab-content">
          {tab === 0 && <GenerateCode />}
          {tab === 1 && <ViewAttendance />}
          {tab === 2 && <ManualCheckIn />}
        </div>
      </div>
    </>
  );
}
