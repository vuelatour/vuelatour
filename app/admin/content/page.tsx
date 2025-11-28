import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContentPageContent from './ContentPageContent';

export default async function ContentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch site content
  const { data: content } = await supabase
    .from('site_content')
    .select('*')
    .order('category', { ascending: true });

  return <ContentPageContent user={user} content={content || []} />;
}
