# 📍 GeoAttend – Geolocation-Based Attendance Tracking System

A full-stack, role-based attendance tracking web app designed for educational or corporate use, enabling secure and efficient attendance marking via **geolocation**, **dynamic attendance codes**, and **manual override by teachers**, with built-in **VPN prevention** mechanisms.

> Developed for Smart India Hackathon 2025  
> Problem Statement ID: 1707  
> Problem Statement Title: Development of a Geolocation-Based Attendance Tracking Application  

---

## ⚙️ Tech Stack

| Layer       | Technology                 |
|-------------|----------------------------|
| Frontend    | Next.js (App Router) + TypeScript + TailwindCSS |
| Backend     | Next.js API Routes (Node.js) |
| ORM         | Prisma                      |
| Database    | PostgreSQL (with PostGIS support optional) |
| Auth        | JWT + bcrypt                |
| Hosting     | Vercel (Frontend + Backend), Supabase/Neon/PostgreSQL (Database) |
| Geolocation | HTML5 Geolocation API + Haversine Formula |
| VPN Check   | `ipapi.co` (free IP geolocation API) |

---

## ✅ Features

### 🔐 Role-Based Login System (via Email)
- Email-based login system using JWT.
- Role is assigned automatically during registration or via admin setup.
- Users are redirected to role-specific dashboards:
  - **Admin**
  - **Teacher**
  - **Student**

---

### 📍 Geolocation-Based Attendance
- Users are automatically **checked in or out** when entering or leaving a **200-meter radius geofence** around the registered location.
- Haversine formula used to calculate user proximity to the office/class location.
- Logs check-in/check-out time and GPS coordinates.
- VPN and location spoof detection via IP location mismatch.

---

### 🚫 VPN Prevention
- Public IP is retrieved using `ipapi.co` or similar services.
- If a VPN or proxy is detected, the user is blocked from using the system.
- Geolocation and IP location mismatches are flagged.

---

### 👩‍🏫 Teacher Features
- **Dropdown filters** for:
  - Department
  - Semester
  - Subject (assigned to that teacher)
- **Generate Attendance Code**:
  - Random alphanumeric code (e.g., `A7B2C3`)
  - Valid for a short duration (e.g., 10 mins)
- **View Attendance Logs** by subject:
  - View present/absent students
  - Check code used, timestamp, location
- **Modify Attendance**:
  - Add/Remove/Update logs manually
  - Mark students as present for missed sessions

---

### 👨‍🎓 Student Features
- **Mark Attendance**:
  - Enter teacher-generated code
  - Must be physically within the geofenced area
- **Attendance Summary Dashboard**:
  - Subject-wise attendance
  - Total classes vs attended
  - Attendance percentage (%)

---

### 👨‍💼 Admin Features
- Add/edit users (students, teachers)
- Assign roles and departments
- Manage subjects
- View system-wide attendance data
- Export logs (CSV support optional)

---

