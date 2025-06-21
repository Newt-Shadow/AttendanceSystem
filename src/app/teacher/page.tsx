// app/teacher/dashboard/page.tsx
import ProtectedPage from '~/app/protected-page';
import TeacherDashboard from '~/components/TeacherDashboard';

export default function TeacherDashboardPage() {
  return (
    <ProtectedPage allowedRoles={['TEACHER']}>
      <TeacherDashboard />
    </ProtectedPage>
  );
}