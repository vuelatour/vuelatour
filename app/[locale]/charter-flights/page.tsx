import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import CharterFlightsContent from './CharterFlightsContent';

interface CharterFlightsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CharterFlightsPageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === 'es' ? 'Vuelos Privados | Vuelatour' : 'Private Charter Flights | Vuelatour',
    description: locale === 'es'
      ? 'Vuelos privados desde Cancún a los mejores destinos del Caribe mexicano. Cozumel, Holbox, Mérida y más.'
      : 'Private charter flights from Cancún to the best destinations in the Mexican Caribbean. Cozumel, Holbox, Mérida and more.',
  };
}

export default async function CharterFlightsPage({ params }: CharterFlightsPageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  // Fetch all active destinations
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return <CharterFlightsContent locale={locale} destinations={destinations || []} />;
}
