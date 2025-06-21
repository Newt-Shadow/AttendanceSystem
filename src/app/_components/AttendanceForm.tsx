"use client";
import { useState } from "react";
import { TextField, Button } from "@mui/material";
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <TextField
        label="Attendance Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        fullWidth
        variant="outlined"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" variant="contained" fullWidth>
        Mark Attendance
      </Button>
    </form>
  );
}