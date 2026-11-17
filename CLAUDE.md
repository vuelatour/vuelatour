# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vuelatour is a bilingual (Spanish/English) website for an air tours and private charter flights company based in Cancún, Mexico. Built with Next.js 15+ App Router, TypeScript, Tailwind CSS, next-intl for internationalization, and Supabase for backend/database.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Internationalization (i18n)
- **Routes**: All public pages are under `app/[locale]/` using dynamic locale segment
- **Supported locales**: `es` (Spanish, default), `en` (English)
- **Configuration**: `i18n.ts` defines request config, `middleware.ts` handles routing
- **Translation files**: `locales/{es,en}/common.json` and `locales/{es,en}/home.json`
- **Pattern**: Use `useTranslations()` hook in client components, `getTranslations()` in server components

### Next.js 15+ Specifics
- **Params as Promise**: Route params must be awaited: `const { locale } = await params;`
- **Middleware file**: Uses `middleware.ts`

### Component Structure
- `components/home/` - Homepage sections (HeroSection, ServicesSection)
- `components/layout/` - Global layout (Header, Footer)
- `components/ui/` - Reusable UI components
- `components/seo/` - SEO components (SchemaMarkup with JSON-LD schemas)
- `components/admin/` - Admin panel components (AdminLayout, AdminSidebar, ImageSelector)
- Client components use `'use client'` directive

### Admin Panel
- **Location**: `app/admin/` (no locale prefix)
- **Authentication**: Supabase Auth with protected routes
- **Pages**:
  - `/admin/dashboard` - Main dashboard
  - `/admin/destinations` - Manage charter flight destinations
  - `/admin/tours` - Manage air tours
  - `/admin/services` - Manage services for destinations/tours
  - `/admin/images` - Image gallery management
  - `/admin/content` - Site content management
  - `/admin/messages` - Contact form messages
  - `/admin/settings` - Site settings

### Database (Supabase)
- **Tables**:
  - `destinations` - Charter flight destinations with pricing, images, services, benefits (JSONB)
  - `air_tours` - Air tours with pricing, duration, images, services, benefits (JSONB)
  - `destination_services` - Services available for destinations
  - `tour_services` - Services available for tours
  - `site_images` - Image gallery with categories (hero, fleet, destinations, tours)
  - `site_content` - Dynamic site content (hero titles, etc.)
  - `contact_messages` - Contact form submissions
- **Storage**: Supabase Storage for image uploads

### Styling & Theme
- **Dark/Light Mode**: Supported via `dark` class on `<html>`, detected from system preference or localStorage
- **Tailwind**: Custom colors in `tailwind.config.ts`
- **CSS Variables**: Defined in `globals.css` with light/dark variants
- **Font**: Inter via next/font

### Color Palette
```
brand-500: #E63946    // Vuelatour red (from logo)
navy-900: #102a43     // Dark mode background (solid navy blue)
navy-950: #0d1f33     // Darker navy for backgrounds
green-500: #22c55e    // Status indicators (available today badge)
```

### Theme Notes
- **Light mode**: Clean whites (#fafafa) and light grays
- **Dark mode**: Solid navy blue tones (no gradients), same brand red
- **Admin**: Always dark mode with navy-900 background
- Colors defined as CSS variables in `globals.css`

### Images & SEO
- **Logo Light**: `public/images/logo/logo-vuelatour.webp` (gray text, for light theme)
- **Logo Dark**: `public/images/logo/logo-vuelatour-dark.webp` (white text, for dark theme)
- **Image Structure**: `public/images/{hero,destinations,tours,fleet,logo,og}/`
- **Optimization**: Using `next/image` with lazy loading, blur placeholders
- **SEO Schemas** (`components/seo/SchemaMarkup.tsx`):
  - `LocalBusinessSchema` - Business info with logo
  - `OrganizationSchema` - Organization with logo and contact
  - `ServiceSchema` - Services offered
  - `TourSchema` - Individual tour details
  - `BreadcrumbSchema` - Breadcrumb navigation
  - `FAQSchema` - FAQ pages
- **Alt Text**: Bilingual alt text for all images
- **Supabase Images**: `next.config.js` configured for Supabase Storage images

### Dynamic Services System
- Services are stored in database tables (`destination_services`, `tour_services`)
- Each destination/tour can select which services are included
- Icons are stored as string keys (e.g., "CheckCircleIcon", "SunIcon") and rendered dynamically via `ICON_MAP`
- Available icons from `@heroicons/react/24/outline`

### Currency Context
- `contexts/CurrencyContext.tsx` provides currency formatting
- Supports USD and MXN with conversion
- Used across the site for price display

### Benefits System
- **Purpose**: "¿Por qué volar a X?" section on destination/tour detail pages
- **Storage**: JSONB column in `destinations` and `air_tours` tables
- **Structure**: Array of 4 benefit objects
  ```json
  [
    { "key": "time", "title_es": "Ahorra tiempo", "title_en": "Save time", "desc_es": "...", "desc_en": "..." },
    { "key": "comfort", "title_es": "Máximo confort", "title_en": "Maximum comfort", "desc_es": "...", "desc_en": "..." },
    { "key": "views", "title_es": "Vistas increíbles", "title_en": "Incredible views", "desc_es": "...", "desc_en": "..." },
    { "key": "flexible", "title_es": "Horarios flexibles", "title_en": "Flexible schedules", "desc_es": "...", "desc_en": "..." }
  ]
  ```
- **Admin UI**: Editable in destinations/tours admin under "Servicios" tab
- **Fallback**: DEFAULT_BENEFITS constant used when database value is null

### Aircraft Pricing System
- **Purpose**: Multiple aircraft pricing options per destination/tour (e.g., Cessna 206, Kodiak 100)
- **Storage**: JSONB column `aircraft_pricing` in `destinations` and `air_tours` tables
- **Structure**: Array of pricing objects
  ```json
  [
    { "aircraft_name": "Cessna 206", "max_passengers": 5, "price_usd": 750, "notes_es": "...", "notes_en": "..." },
    { "aircraft_name": "Kodiak 100", "max_passengers": 9, "price_usd": 1690, "notes_es": "...", "notes_en": "..." }
  ]
  ```
- **Admin UI**: Editable in destinations/tours admin under "Precios" tab
- **Display**: Shows pricing cards in destination detail sidebar

### Third-party scripts & CSP
- `next.config.js` sends a strict `Content-Security-Policy` on every route. A new external script only works if its host is added there: `script-src` for the script itself and `connect-src` for anything it fetches. Without that the browser blocks it silently (console error only, nothing on screen).
- Third-party scripts for the public site go in `app/[locale]/layout.tsx` as a plain `<script async src>` (same as gtag). `app/admin/layout.tsx` is a separate root layout, so they never load in the admin panel.
- **Tourist.com offers widget** (`https://partners.tourist.com/w/offers.js?id=80648`, added Nov 2026): floating "Offers" button + panel, rendered in a Shadow DOM element (`<tourist-offers>`) appended to `<html>`.
  - It reads the partner id from its own `src` (`document.currentScript`) and then fetches `https://partners.tourist.com/w/offers/80648.json`. If the id is missing from the URL it shows its built-in demo data (a hotel), so never bundle, proxy or rename the script.
  - Offers, colors, button style, side and language come from the Tourist.com partner panel (`config` in that JSON), not from this repo. With no offers, or with the widget disabled there, nothing is rendered.
  - No cookies; it only writes the `sessionStorage` key `tw_seen`.
