
"use client";
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
    <>
      <style jsx>{`
        .sidebar {
          font-family: 'Roboto', sans-serif;
          width: 240px;
          background-color: #fff;
          border-right: 1px solid #e0e0e0;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 1200;
          box-sizing: border-box;
          overflow-y: auto;
        }

        .list {
          padding: 8px 0;
          margin: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
        }

        .list-item {
          padding: 0;
        }

        .list-item-link {
          display: block;
          padding: 8px 16px;
          color: rgba(0, 0, 0, 0.87);
          font-size: 0.875rem;
          font-weight: 400;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .list-item-link:hover {
          background-color: #f5f5f5;
        }
      `}</style>
      <aside className="sidebar">
        <ul className="list">
          {links.map((link) => (
            <li key={link.href} className="list-item">
              <Link href={link.href} className="list-item-link">
                <span>{link.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
