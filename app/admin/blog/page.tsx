import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BlogAdminContent from './BlogAdminContent';

export default async function BlogAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  return <BlogAdminContent user={user} posts={posts || []} />;
}
