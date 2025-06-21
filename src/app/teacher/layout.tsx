import { Sidebar } from "~/app/_components/Sidebar";
import { redirect } from "next/navigation";
import { verifyToken } from "~/lib/auth";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const token = process.env.NODE_ENV === "production" ? "" : localStorage.getItem("token");
  if (!token) redirect("/login");

  try {
    const user = await verifyToken(token);
    if (user.role !== "TEACHER") redirect("/login");
    return (
      <div className="flex">
        <Sidebar role="TEACHER" />
        <div className="flex-1 p-4">{children}</div>
      </div>
    );
  } catch {
    redirect("/login");
  }
}