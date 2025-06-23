// app/teacher/page.tsx
import ProtectedPage  from '~/app/protected-page';
import TeacherDashboard from '~/components/TeacherDashboard';

export default function TeacherPage() {
  return (
    <ProtectedPage allowedRoles={['TEACHER']}>
      <TeacherDashboard />
    </ProtectedPage>
  );
}