import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TestimonialsContent from './TestimonialsContent';

export default async function TestimonialsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true });

  return <TestimonialsContent user={user} testimonials={testimonials || []} />;
}
