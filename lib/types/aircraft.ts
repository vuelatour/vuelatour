export interface Aircraft {
  id: string;
  name: string;
  slug: string;
  max_passengers: number;
  description_es: string | null;
  description_en: string | null;
  image_url: string | null;
  gallery_images: string[];
  specs: Record<string, string>;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AircraftPricing {
  aircraft_id: string;
  aircraft_name: string;
  max_passengers: number;
  price_usd: number;
  notes_es: string;
  notes_en: string;
}
