import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Redirect to login page
  // Later this will check if user is authenticated and redirect to dashboard
  redirect('/admin/login');
}
