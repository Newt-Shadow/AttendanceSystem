
"use client";
import { useState } from "react";
import { AttendanceForm } from "~/app/_components/AttendanceForm";
import { AttendanceSummary } from "~/app/_components/AttendanceSummary";
import { trpc } from "~/lib/trpc-client";

export default function StudentPage() {
  const [tab, setTab] = useState(0);
  const { data: user } = trpc.user.getUsers.useQuery();

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
      `}</style>
      <div className="container">
        <h1 className="header">Student Dashboard</h1>
        <div className="tabs">
          <button className={`tab ${tab === 0 ? 'active' : ''}`} onClick={() => setTab(0)}>
            Mark Attendance
          </button>
          <button className={`tab ${tab === 1 ? 'active' : ''}`} onClick={() => setTab(1)}>
            View Summary
          </button>
        </div>
        <div className="tab-content">
          {tab === 0 && <AttendanceForm userId={user?.[0]?.id || 0} />}
          {tab === 1 && <AttendanceSummary userId={user?.[0]?.id || 0} />}
        </div>
      </div>
    </>
  );
}
