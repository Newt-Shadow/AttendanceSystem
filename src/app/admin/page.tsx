// app/admin/dashboard/page.tsx
import ProtectedPage from '~/app/protected-page';
import AdminDashboard from '~/components/AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <ProtectedPage allowedRoles={['ADMIN']}>
      <AdminDashboard />
    </ProtectedPage>
  );
}