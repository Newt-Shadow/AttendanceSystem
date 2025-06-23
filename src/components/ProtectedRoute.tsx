// src/components/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser } from '../lib/api';

interface User {
  id: number;
  role: string;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = sessionStorage.getItem('jwt_token');
        console.log('ProtectedRoute: sessionStorage token:', token ? token.substring(0, 20) + '...' : 'none');
        console.log('ProtectedRoute: pathname:', pathname);
        console.log('ProtectedRoute: document.referrer:', document.referrer);
        const userData = await getCurrentUser();
        console.log('ProtectedRoute: Fetched user:', userData);
        setUser(userData);
        setLoading(false);
        if (!userData || !allowedRoles.includes(userData.role)) {
          console.log('ProtectedRoute: Unauthorized, redirecting to /login');
          sessionStorage.removeItem('jwt_token');
          router.push('/login');
        }
      } catch (error) {
        console.error('ProtectedRoute: Error fetching user:', error);
        sessionStorage.removeItem('jwt_token');
        setLoading(false);
        router.push('/login');
      }
    }
    fetchUser();
  }, [router, allowedRoles, pathname]);

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}