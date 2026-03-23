import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import FAQsContent from './FAQsContent';

export default async function FAQsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .order('display_order', { ascending: true });

  return <FAQsContent user={user} faqs={faqs || []} />;
}
