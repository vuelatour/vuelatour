# Plan de Mejoras SEO - Vuelatour

> Documento de referencia para implementación y continuación futura.
> Fecha de creación: 2026-03-23

---

## Estado actual del SEO (antes de mejoras)

### Lo que YA existe y funciona bien:

| Elemento | Ubicación | Estado |
|----------|-----------|--------|
| JSON-LD LocalBusiness | `components/seo/SchemaMarkup.tsx` (L10-95) | OK |
| JSON-LD Organization | `components/seo/SchemaMarkup.tsx` (L230-315) | OK |
| JSON-LD Service | `components/seo/SchemaMarkup.tsx` (L101-163) | OK |
| JSON-LD Product (destinos) | `components/seo/SchemaMarkup.tsx` (L391-472) | OK |
| JSON-LD Product (tours) | `components/seo/SchemaMarkup.tsx` (L488-569) | OK |
| JSON-LD Breadcrumb | `components/seo/SchemaMarkup.tsx` (L321-340) | OK |
| JSON-LD FAQ (componente) | `components/seo/SchemaMarkup.tsx` (L346-367) | Existe pero sin uso |
| Sitemap dinámico | `app/sitemap.ts` | OK - Fetch destinos/tours de Supabase |
| robots.txt | `public/robots.txt` | OK - Bloquea /admin, /_next, /api |
| Canonical URLs | Todas las páginas vía `generateMetadata` | OK |
| Hreflang (es/en) | Todas las páginas vía `alternates.languages` | OK |
| Open Graph | Todas las páginas | OK |
| Twitter Cards | Todas las páginas | OK |
| GA4 con consentimiento | `lib/analytics.ts` | OK - ID: G-HN7PLHRVGY |
| next/image optimization | Todo el sitio | OK - AVIF/WebP |
| Alt text bilingüe | Imágenes de galería via `site_images` | OK |
| Redirect www | `next.config.js` | OK - 308 permanent |
| Keywords por página | `generateMetadata` en cada page.tsx | OK |

### Base de datos relevante:

| Tabla | Campos SEO | Uso |
|-------|-----------|-----|
| `destinations` | `meta_title_es/en`, `meta_description_es/en`, `long_description_es/en` | Metadata + contenido detallado |
| `air_tours` | `meta_title_es/en`, `meta_description_es/en`, `long_description_es/en` | Metadata + contenido detallado |
| `site_content` | `key`, `value_es`, `value_en`, `category` | Contenido dinámico del sitio |
| `site_images` | `url`, `alt_es`, `alt_en`, `category` | Alt text de imágenes |
| `legal_pages` | `slug`, `title_es/en`, `content_es/en` | Páginas legales |

### Constantes:

| Constante | Valor | Ubicación |
|-----------|-------|-----------|
| FOUNDING_YEAR | 2001 | `lib/constants.ts` |
| Teléfono | +52 998 740 7149 | `contact_info` table |
| Email | info@vuelatour.com | `contact_info` table |
| Dirección | Aeropuerto de Cancún, Terminal FBO | `contact_info` table |
| GA4 ID | G-HN7PLHRVGY | `lib/analytics.ts` |

---

## Plan de implementación

### P1: Página "Nosotros" (About Us) - E-E-A-T

**Objetivo:** Demostrar Experiencia, Expertise, Autoridad y Confianza a Google.

**Rutas:**
- Público: `/es/about` y `/en/about`
- Archivos: `app/[locale]/about/page.tsx` + `AboutContent.tsx`

**Contenido necesario (preguntar al cliente si no se tiene):**
- Historia de la empresa (2001 - presente)
- Certificaciones TAI & TAN (qué significan, por qué importan)
- Experiencia de pilotos (años, horas de vuelo)
- Número de vuelos realizados
- Fotos del equipo / pilotos
- Valores / misión de la empresa

**Schema:** OrganizationSchema ya existe, se reutiliza. Agregar `AboutPage` schema.

**Impacto:** Alto - Google evalúa E-E-A-T especialmente en servicios de transporte/aviación.

**Implementación:**
- Crear `app/[locale]/about/page.tsx` con generateMetadata
- Crear `app/[locale]/about/AboutContent.tsx` con secciones:
  - Hero con datos clave (años, vuelos, rating)
  - Historia de la empresa
  - Certificaciones y seguridad
  - La flota (link a /fleet)
  - CTA a contacto
- Agregar link en Header y Footer
- Agregar a sitemap
- Agregar traducciones a `locales/es/common.json` y `locales/en/common.json`

---

### P2: Sistema FAQ con Schema

**Objetivo:** Capturar snippets de Google ("Más preguntas") y long-tail keywords.

**Implementación en 2 niveles:**

#### Nivel 1: FAQ en base de datos
**Nueva tabla en Supabase:**
```sql
CREATE TABLE public.faqs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_es text NOT NULL,
  question_en text NOT NULL,
  answer_es text NOT NULL,
  answer_en text NOT NULL,
  category varchar NOT NULL DEFAULT 'general',
  -- Categorías: 'general', 'charter', 'tours', 'safety', 'pricing'
  related_destination_id uuid REFERENCES destinations(id),
  related_tour_id uuid REFERENCES air_tours(id),
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Nivel 2: Componente FAQ reutilizable
**Archivo:** `components/ui/FAQSection.tsx`
- Muestra preguntas y respuestas con acordeón
- Acepta array de FAQs como prop
- Renderiza FAQSchema automáticamente

#### Nivel 3: FAQ en páginas de detalle
- Cada destino/tour puede tener FAQs específicas (via `related_destination_id` / `related_tour_id`)
- Se muestran al final de la página de detalle
- Schema FAQPage incluido automáticamente

#### Nivel 4: Página FAQ dedicada
**Ruta:** `/es/faq` y `/en/faq`
- Muestra todos los FAQs agrupados por categoría
- Schema FAQPage completo

**FAQs iniciales sugeridas:**
1. "¿Cuánto cuesta un vuelo privado desde Cancún?" → Explicar rango de precios
2. "¿Cuántos pasajeros caben en un vuelo privado?" → Mencionar flota
3. "¿Es seguro volar en avioneta?" → Certificaciones TAI & TAN
4. "¿Con cuánta anticipación debo reservar?" → Proceso de reserva
5. "¿Qué incluye el servicio?" → Lista de servicios
6. "¿Puedo llevar equipaje?" → Restricciones
7. "¿Cuánto dura el vuelo a Cozumel/Holbox/etc?" → Tiempos por destino
8. "¿Operan en temporada de lluvias?" → Seguridad y clima

**Schema existente:** `FAQSchema` ya existe en `components/seo/SchemaMarkup.tsx` (L346-367) - se reutiliza.

---

### P3: Contenido extendido en páginas de listado

**Objetivo:** Pasar de ~200 palabras a ~800+ palabras en páginas de listado.

**Archivos a modificar:**
- `app/[locale]/charter-flights/CharterFlightsContent.tsx` - Agregar sección informativa
- `app/[locale]/air-tours/AirToursContent.tsx` - Agregar sección informativa

**Contenido a agregar (después del grid de destinos/tours):**

Para Charter Flights:
- "¿Por qué elegir un vuelo privado?" (beneficios vs comercial)
- "Destinos populares desde Cancún" (resumen con links internos)
- "¿Cómo funciona?" (proceso de reserva paso a paso)

Para Air Tours:
- "La experiencia de un tour aéreo" (qué esperar)
- "Nuestras rutas más populares" (resumen con links)
- "Preguntas frecuentes sobre tours aéreos" (mini FAQ)

**Schema:** No requiere nuevo schema, el ServiceSchema ya cubre esto.

---

### P4: Testimonios con ReviewSchema

**Objetivo:** Respaldar el aggregateRating (4.9, 150 reviews) con testimonios reales visibles.

**Nueva tabla en Supabase:**
```sql
CREATE TABLE public.testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name varchar NOT NULL,
  author_location varchar,  -- "Texas, USA" o "CDMX, México"
  rating integer NOT NULL DEFAULT 5,  -- 1-5
  text_es text NOT NULL,
  text_en text NOT NULL,
  service_type varchar,  -- 'charter', 'tour', 'general'
  related_destination_id uuid REFERENCES destinations(id),
  related_tour_id uuid REFERENCES air_tours(id),
  source varchar DEFAULT 'google',  -- 'google', 'tripadvisor', 'direct'
  date date,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

**Componente:** `components/ui/TestimonialsSection.tsx`
- Carrusel de testimonios
- Rating con estrellas
- Nombre, ubicación, fecha
- Badge de fuente (Google, TripAdvisor)

**Schema:** `ReviewSchema` nuevo a agregar en `SchemaMarkup.tsx`

**Ubicaciones:**
- Homepage: sección de testimonios después de servicios
- Páginas de detalle: testimonios relacionados al destino/tour
- Página About: sección de confianza

**Datos iniciales:** Se necesitan testimonios REALES del cliente (Google Reviews, TripAdvisor, etc.)

---

### P5: Blog / Guías de viaje

**Objetivo:** Capturar keywords informacionales (long-tail) que traen tráfico orgánico.

**Nueva tabla en Supabase:**
```sql
CREATE TABLE public.blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug varchar NOT NULL UNIQUE,
  title_es varchar NOT NULL,
  title_en varchar NOT NULL,
  excerpt_es text,
  excerpt_en text,
  content_es text NOT NULL,  -- Markdown
  content_en text NOT NULL,  -- Markdown
  image_url text,
  category varchar NOT NULL DEFAULT 'guides',
  -- Categorías: 'guides', 'destinations', 'tips', 'news'
  tags text[] DEFAULT '{}',
  meta_title_es text,
  meta_title_en text,
  meta_description_es text,
  meta_description_en text,
  author varchar DEFAULT 'Vuelatour',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Rutas:**
- Listado: `/es/blog` y `/en/blog`
- Detalle: `/es/blog/[slug]` y `/en/blog/[slug]`

**Archivos:**
- `app/[locale]/blog/page.tsx` - Listado con generateMetadata
- `app/[locale]/blog/BlogContent.tsx` - Grid de artículos
- `app/[locale]/blog/[slug]/page.tsx` - Detalle con generateMetadata
- `app/[locale]/blog/[slug]/BlogPostContent.tsx` - Renderizado Markdown

**Schema:** `Article` schema para cada post, `BlogPosting` para SEO

**Artículos iniciales sugeridos (contenido a redactar):**
1. "Guía completa: Vuelo privado a Chichén Itzá desde Cancún"
2. "Cozumel desde el aire: Lo que verás en un tour aéreo"
3. "¿Vuelo privado o autobús? Comparativa para viajar a Holbox"
4. "5 razones para elegir un vuelo panorámico en tu visita a Cancún"
5. "Temporada ideal para tours aéreos en la Riviera Maya"

**Admin:** Nueva sección en `/admin/blog` para gestionar posts.

---

### P6: Enriquecer long_description de destinos/tours

**Objetivo:** Contenido más profundo en páginas de detalle para mejorar rankings.

**Campos existentes en BD:**
- `destinations.long_description_es` / `long_description_en` (TEXT, Markdown)
- `air_tours.long_description_es` / `long_description_en` (TEXT, Markdown)

**Estado actual:** Posiblemente vacíos o con contenido genérico.

**Template de contenido ideal por destino:**

```markdown
## Vuelo privado a [Destino] desde Cancún

### La experiencia del vuelo
[Descripción del vuelo, qué se ve, duración, ruta]

### ¿Por qué volar a [Destino]?
[Beneficios vs transporte terrestre]

### Qué hacer al llegar
[Actividades principales en el destino]

### Mejor temporada para visitar
[Clima, temporadas, recomendaciones]

### Información práctica
- **Tiempo de vuelo:** [X] minutos
- **Aeronaves disponibles:** [Lista]
- **Aeropuerto de llegada:** [Nombre]
```

**Acción:** Esto requiere contenido del cliente o redacción profesional. Se puede dejar la estructura lista en el admin y que ellos lo llenen.

---

## Archivos clave de referencia

| Archivo | Propósito | Líneas clave |
|---------|-----------|-------------|
| `components/seo/SchemaMarkup.tsx` | Todos los JSON-LD schemas | 569 líneas, 7 schemas |
| `app/sitemap.ts` | Sitemap dinámico | Fetch de destinations + air_tours |
| `app/[locale]/layout.tsx` | Layout con preconnects, theme, providers | Metadata base, viewport |
| `app/[locale]/page.tsx` | Homepage con schemas | Lines 87-112 schemas |
| `lib/constants.ts` | FOUNDING_YEAR (2001), getYearsOfExperience | Usado en schemas |
| `middleware.ts` | i18n routing, admin auth | Locales: es, en |
| `next.config.js` | www redirect, headers, images | Security + SEO headers |
| `public/robots.txt` | Crawl rules | Allow /, Disallow /admin |
| `locales/es/common.json` | Traducciones nav + footer ES | nav, contact, footer keys |
| `locales/en/common.json` | Traducciones nav + footer EN | Same structure |
| `locales/es/home.json` | Traducciones homepage ES | hero, services, charterFlights, airTours |
| `locales/en/home.json` | Traducciones homepage EN | Same structure |

---

## Estado de implementación (actualizado 2026-03-23)

### Completado:

- [x] **P1: Página About Us** — `app/[locale]/about/page.tsx` + `AboutContent.tsx`
- [x] **P2: FAQ con Schema** — Tabla `faqs` (8 FAQs), `components/ui/FAQSection.tsx`, `/faq` page, FAQs en detail pages
- [x] **P3: Contenido extendido** — Secciones "Por qué elegir" y "Cómo funciona" en CharterFlights + AirTours
- [x] **P4: Testimonios** — Tabla `testimonials` (9 reales de TripAdvisor), sección unificada en homepage con link a TripAdvisor
- [x] **P5: Blog** — Tabla `blog_posts`, pages `/blog` + `/blog/[slug]`, Article schema, 1 artículo publicado (Chichén Itzá)
- [x] **P6: Long descriptions** — Todos los destinos y tours enriquecidos con secciones ## (1500-2100 chars cada uno)
- [x] **Admin pages** — `/admin/faqs`, `/admin/testimonials`, `/admin/blog` con CRUD completo
- [x] **Sitemap** — Incluye about, fleet, faq, blog + blog posts dinámicos
- [x] **Footer** — 5 columnas: Brand, Services, Company (About, Blog, FAQ), Legal, Contact
- [x] **Header** — Links: Charter Flights, Air Tours, Our Fleet, Contact
- [x] **Traducciones** — nav.fleet, nav.about en es/en
- [x] Todas las páginas nuevas tienen `generateMetadata` con title, description, OG, Twitter, alternates
- [x] Testimonios son datos REALES de TripAdvisor

### Tablas nuevas en Supabase:

| Tabla | Registros | RLS | Índices |
|-------|-----------|-----|---------|
| `aircraft` | 4 (Kodiak 100, Piper Seneca V, Cessna 206, Cessna 182) | Public read, auth write | `idx_aircraft_active_order` |
| `faqs` | 8 (general, pricing, charter, safety) | Public read, auth write | `idx_faqs_active` |
| `testimonials` | 9 (4 featured) | Public read, auth write | `idx_testimonials_active` |
| `blog_posts` | 1 (Chichén Itzá guide, published) | Public read, auth write | `idx_blog_posts_published` |

### Admin sidebar links:

| Sección | Ruta | Componente |
|---------|------|-----------|
| Flota | `/admin/fleet` | `FleetContent.tsx` |
| FAQs | `/admin/faqs` | `FAQsContent.tsx` |
| Testimonios | `/admin/testimonials` | `TestimonialsContent.tsx` |
| Blog | `/admin/blog` | `BlogAdminContent.tsx` |

### Pendiente post-deploy:

- [ ] Schemas JSON-LD validados en https://search.google.com/test/rich-results
- [ ] No hay errores en Google Search Console
- [ ] Core Web Vitals no degradados (verificar en PageSpeed Insights)
- [ ] Subir fotos de aeronaves desde `/admin/fleet`
- [ ] Crear más artículos de blog (sugeridos: Cozumel, Holbox, 5 razones vuelo panorámico)
- [ ] Re-vincular aeronaves al catálogo en precios de destinos/tours
