import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import FleetContent from './FleetContent';

export default async function FleetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: aircraft } = await supabase
    .from('aircraft')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <FleetContent
      user={user}
      aircraft={aircraft || []}
    />
  );
}
