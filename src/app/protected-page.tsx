// app/protected-page.tsx
import { getUser } from '~/lib/auth';
import { ProtectedRoute } from '~/components/ProtectedRoute';

interface ProtectedPageProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default async function ProtectedPage({ children, allowedRoles }: ProtectedPageProps) {
  const user = await getUser(); // Await the promise on the server
  return <ProtectedRoute user={user} allowedRoles={allowedRoles}>{children}</ProtectedRoute>;
}