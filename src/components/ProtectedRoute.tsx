'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  role: string;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  user: User | null; // Pass user as a prop
}

export function ProtectedRoute({ children, allowedRoles, user }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    if (!user || !allowedRoles.includes(user.role)) {
      router.push('/login');
    }
  }, [user, allowedRoles, router]);

  if (!user || !allowedRoles.includes(user.role)) return null;
  return <>{children}</>;
}