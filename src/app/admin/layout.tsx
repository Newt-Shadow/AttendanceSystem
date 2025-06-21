import { cookies } from "next/headers";
import { Sidebar } from "~/app/_components/Sidebar";
import { redirect } from "next/navigation";
import { verifyToken } from "~/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies(); // <-- await here
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const user = await verifyToken(token);
    if (user.role !== "ADMIN") {
      redirect("/login");
    }

    return (
      <div className="flex">
        <Sidebar role="ADMIN" />
        <div className="flex-1 p-4">{children}</div>
      </div>
    );
  } catch {
    redirect("/login");
  }
}
