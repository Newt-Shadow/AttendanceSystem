/*
  Warnings:

  - A unique constraint covering the columns `[studentId,sessionId]` on the table `AttendanceRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_studentId_sessionId_key" ON "AttendanceRecord"("studentId", "sessionId");
