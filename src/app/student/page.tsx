"use client";
import { useState } from "react";
import { Typography, Tabs, Tab, Box } from "@mui/material";
import { AttendanceForm } from "~/app/_components/AttendanceForm";
import { AttendanceSummary } from "~/app/_components/AttendanceSummary";
import { trpc } from "~/lib/trpc-client";

export default function StudentPage() {
  const [tab, setTab] = useState(0);
  const { data: user } = trpc.user.getUsers.useQuery(); // Assuming user data is fetched

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
        <Tab label="Mark Attendance" />
        <Tab label="View Summary" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tab === 0 && <AttendanceForm userId={user?.[0]?.id || 0} />}
        {tab === 1 && <AttendanceSummary userId={user?.[0]?.id || 0} />}
      </Box>
    </div>
  );
}