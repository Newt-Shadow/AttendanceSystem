// app/protected-page.tsx
import { ProtectedRoute } from '~/components/ProtectedRoute';

interface ProtectedPageProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedPage({ children, allowedRoles }: ProtectedPageProps) {
  return <ProtectedRoute allowedRoles={allowedRoles}>{children}</ProtectedRoute>;
}