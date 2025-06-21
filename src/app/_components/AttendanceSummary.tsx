"use client";
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { trpc } from "~/lib/trpc-client";

export function AttendanceSummary({ userId }: { userId: number }) {
  const { data: summary, isLoading } = trpc.attendance.getAttendanceSummary.useQuery();

  if (isLoading) return <Typography>Loading...</Typography>;
  if (!summary || summary.length === 0) return <Typography>No attendance data available.</Typography>;

  return (
    <div className="mt-4">
      <Typography variant="h6" gutterBottom>
        Attendance Summary
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Subject</TableCell>
            <TableCell align="right">Attended</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="right">Percentage</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {summary.map((item) => (
            <TableRow key={item.subject}>
              <TableCell>{item.subject}</TableCell>
              <TableCell align="right">{item.attended}</TableCell>
              <TableCell align="right">{item.total}</TableCell>
              <TableCell align="right">{item.percentage.toFixed(2)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}