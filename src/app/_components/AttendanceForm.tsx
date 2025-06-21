
"use client";
import { useState } from "react";
import { trpc } from "~/lib/trpc-client";

export function AttendanceForm({ userId }: { userId: number }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useContext();

  const markAttendance = trpc.attendance.markAttendance.useMutation({
    onSuccess: () => {
      utils.attendance.getAttendanceSummary.invalidate();
      setCode("");
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const ipRes = await fetch("https://api.ipify.org?format=json");
          const { ip } = await ipRes.json();
          await markAttendance.mutateAsync({
            code,
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            ip,
          });
        } catch (err) {
          setError((err as Error).message);
        }
      },
      () => setError("Geolocation not available")
    );
  };

  return (
    <>
      <style jsx>{`
        .form-container {
          font-family: 'Roboto', sans-serif;
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

        .input-field:not(:placeholder-shown) + .input-label,
        .input-field:focus + .input-label {
          top: 0;
          font-size: 12px;
          color: #1976d2;
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

        .submit-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
      `}</style>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto form-container">
        <div className="input-container">
          <input
            type="text"
            id="attendance-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input-field"
            placeholder=" "
          />
          <label htmlFor="attendance-code" className="input-label">
            Attendance Code
          </label>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="submit-button">
          Mark Attendance
        </button>
      </form>
    </>
  );
}
