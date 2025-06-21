// app/student/dashboard/page.tsx
import ProtectedPage  from '~/app/protected-page';
import StudentDashboard from '~/components/StudentDashboard';

export default function StudentDashboardPage() {
  return (
    <ProtectedPage allowedRoles={['STUDENT']}>
      <StudentDashboard />
    </ProtectedPage>
  );
}