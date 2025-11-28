import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ToursContent from './ToursContent';

export default async function ToursPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch air tours
  const { data: tours } = await supabase
    .from('air_tours')
    .select('*')
    .order('display_order', { ascending: true });

  // Fetch available services
  const { data: availableServices } = await supabase
    .from('tour_services')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return (
    <ToursContent
      user={user}
      tours={tours || []}
      availableServices={availableServices || []}
    />
  );
}
