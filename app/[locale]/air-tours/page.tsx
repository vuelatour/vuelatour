import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AirToursContent from './AirToursContent';

interface AirToursPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AirToursPageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === 'es' ? 'Tours Aéreos Panorámicos | Vuelatour' : 'Panoramic Air Tours | Vuelatour',
    description: locale === 'es'
      ? 'Experiencias aéreas únicas sobre Cancún, la Riviera Maya y la Zona Arqueológica. Vistas inolvidables del Caribe mexicano.'
      : 'Unique aerial experiences over Cancún, the Riviera Maya and the Archaeological Zone. Unforgettable views of the Mexican Caribbean.',
  };
}

export default async function AirToursPage({ params }: AirToursPageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  // Fetch all active tours
  const { data: tours } = await supabase
    .from('air_tours')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return <AirToursContent locale={locale} tours={tours || []} />;
}
