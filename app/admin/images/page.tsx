import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ImagesContent from './ImagesContent';

export default async function ImagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch site images
  const { data: images } = await supabase
    .from('site_images')
    .select('*')
    .order('category', { ascending: true });

  return <ImagesContent user={user} images={images || []} />;
}
