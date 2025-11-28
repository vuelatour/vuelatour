import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MessagesContent from './MessagesContent';

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch contact requests
  const { data: messages } = await supabase
    .from('contact_requests')
    .select('*')
    .order('created_at', { ascending: false });

  return <MessagesContent user={user} messages={messages || []} />;
}
