import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SettingsContent from './SettingsContent';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch site settings
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*');

  return <SettingsContent user={user} settings={settings || []} />;
}
