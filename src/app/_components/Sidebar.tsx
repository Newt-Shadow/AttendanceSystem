"use client";
import { Drawer, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import Link from "next/link";

export function Sidebar({ role }: { role: string }) {
  const links = {
    ADMIN: [
      { name: "Manage Users", href: "/admin/users" },
      { name: "Manage Subjects", href: "/admin/subjects" },
    ],
    TEACHER: [
      { name: "Generate Code", href: "/teacher/generate" },
      { name: "View Attendance", href: "/teacher/attendance" },
      { name: "Manual Check-In", href: "/teacher/manual" },
    ],
    STUDENT: [
      { name: "Mark Attendance", href: "/student/mark" },
      { name: "View Summary", href: "/student/summary" },
    ],
  }[role] || [];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box" },
      }}
    >
      <List>
        {links.map((link) => (
          <ListItem key={link.href} disablePadding>
            <Link href={link.href} passHref legacyBehavior>
              <ListItemButton component="a">
                <ListItemText primary={link.name} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
