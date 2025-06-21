import '../styles/globals.css';
import type { ReactNode } from 'react';
import MUIProvider from '~/components/MUIProvider';

export const metadata = {
  title: 'Attendance System',
  description: 'Student and Teacher Attendance Dashboard',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MUIProvider>
          {children}
        </MUIProvider>
      </body>
    </html>
  );
}
