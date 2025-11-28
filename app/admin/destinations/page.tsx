import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DestinationsContent from './DestinationsContent';

export default async function DestinationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch destinations
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .order('display_order', { ascending: true });

  // Fetch available services
  const { data: availableServices } = await supabase
    .from('destination_services')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return (
    <DestinationsContent
      user={user}
      destinations={destinations || []}
      availableServices={availableServices || []}
    />
  );
}
