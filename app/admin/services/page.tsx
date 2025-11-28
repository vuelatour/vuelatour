import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ServicesContent from './ServicesContent';

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch destination services
  const { data: destinationServices } = await supabase
    .from('destination_services')
    .select('*')
    .order('display_order', { ascending: true });

  // Fetch tour services
  const { data: tourServices } = await supabase
    .from('tour_services')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <ServicesContent
      user={user}
      destinationServices={destinationServices || []}
      tourServices={tourServices || []}
    />
  );
}
