
"use client";
import { useState } from "react";
import { trpc } from "~/lib/trpc-client";

export function AttendanceSummary({ userId }: { userId: number }) {
  const { data: summary, isLoading } = trpc.attendance.getAttendanceSummary.useQuery();

  if (isLoading) return <p className="text-base">Loading...</p>;
  if (!summary || summary.length === 0) return <p className="text-base">No attendance data available.</p>;

  return (
    <>
      <style jsx>{`
        .container {
          font-family: 'Roboto', sans-serif;
          color: rgba(0, 0, 0, 0.87);
        }

        .header {
          font-size: 1.25rem;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .text {
          font-size: 1rem;
          font-weight: 400;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
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

        .table-head-cell-right {
          text-align: right;
        }

        .table-body-cell {
          padding: 16px;
          border-bottom: 1px solid #e0e0e0;
          text-align: left;
        }

        .table-body-cell-right {
          text-align: right;
        }

        .table-row:hover {
          background-color: #f5f5f5;
        }
      `}</style>
      <div className="mt-4 container">
        <h2 className="header">Attendance Summary</h2>
        <table className="table">
          <thead className="table-head">
            <tr>
              <th className="table-head-cell">Subject</th>
              <th className="table-head-cell table-head-cell-right">Attended</th>
              <th className="table-head-cell table-head-cell-right">Total</th>
              <th className="table-head-cell table-head-cell-right">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item) => (
              <tr key={item.subject} className="table-row">
                <td className="table-body-cell">{item.subject}</td>
                <td className="table-body-cell table-body-cell-right">{item.attended}</td>
                <td className="table-body-cell table-body-cell-right">{item.total}</td>
                <td className="table-body-cell table-body-cell-right">{item.percentage.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
