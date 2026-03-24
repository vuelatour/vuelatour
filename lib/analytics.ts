// Google Analytics 4 + Google Ads conversion tracking
// GA4 ID: G-HN7PLHRVGY
// Google Ads ID: AW-11193736446

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA_MEASUREMENT_ID = 'G-HN7PLHRVGY';
const GOOGLE_ADS_ID = 'AW-11193736446';
const GADS_CONVERSION_LABEL_EN = 'lrI6CPaB_44cEP65y9kp';
const GADS_CONVERSION_LABEL_ES = 'er04CPX77I4cEP65y9kp';

// Check if analytics consent was given
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const consent = localStorage.getItem('vuelatour_cookie_consent');
    if (consent) {
      const parsed = JSON.parse(consent);
      return parsed.analytics === true;
    }
  } catch {
    // Invalid consent data
  }
  return false;
}

// Initialize GA4 (called when consent is given)
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;

  // Load gtag script if not already loaded
  if (!document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    script.defer = true; // Defer execution for better performance
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    // Performance optimization: send minimal data on initial load
    send_page_view: true,
  });

  // Configure Google Ads conversion tracking
  window.gtag('config', GOOGLE_ADS_ID);
}

// Track page views (for SPA navigation)
export function trackPageView(url: string, title?: string): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (!hasAnalyticsConsent()) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title,
  });
}

// Generic event tracking
export function trackEvent(
  eventName: string,
  parameters?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (!hasAnalyticsConsent()) return;

  window.gtag('event', eventName, parameters);
}

// ============================================
// CONVERSION EVENTS
// ============================================

// Track WhatsApp button clicks
export function trackWhatsAppClick(source: string, itemName?: string): void {
  trackEvent('whatsapp_click', {
    event_category: 'conversion',
    event_label: source,
    item_name: itemName || 'general',
  });
}

// Track contact form submission
export function trackContactFormSubmit(formType: string = 'contact'): void {
  trackEvent('form_submit', {
    event_category: 'conversion',
    event_label: formType,
    form_name: formType,
  });
}

// Fire Google Ads conversion event on successful booking/quote submission
export function trackGoogleAdsConversion(locale: string): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (!hasAnalyticsConsent()) return;

  const label = locale === 'es' ? GADS_CONVERSION_LABEL_ES : GADS_CONVERSION_LABEL_EN;
  window.gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${label}`,
  });
}

// Track "Reserve Now" / "Book Now" button clicks
export function trackBookingClick(itemType: 'destination' | 'tour', itemName: string): void {
  trackEvent('begin_checkout', {
    event_category: 'conversion',
    item_category: itemType,
    item_name: itemName,
  });
}

// ============================================
// ENGAGEMENT EVENTS
// ============================================

// Track destination/tour detail page views
export function trackItemView(itemType: 'destination' | 'tour', itemName: string, itemId: string): void {
  trackEvent('view_item', {
    event_category: 'engagement',
    item_category: itemType,
    item_name: itemName,
    item_id: itemId,
  });
}

// Track "View Details" clicks from listing pages
export function trackViewDetailsClick(itemType: 'destination' | 'tour', itemName: string): void {
  trackEvent('select_item', {
    event_category: 'engagement',
    item_category: itemType,
    item_name: itemName,
  });
}

// Track language change
export function trackLanguageChange(newLocale: string): void {
  trackEvent('language_change', {
    event_category: 'engagement',
    new_language: newLocale,
  });
}

// Track currency change
export function trackCurrencyChange(newCurrency: string): void {
  trackEvent('currency_change', {
    event_category: 'engagement',
    new_currency: newCurrency,
  });
}

// Track phone call clicks
export function trackPhoneClick(source: string): void {
  trackEvent('phone_click', {
    event_category: 'conversion',
    event_label: source,
  });
}

// Track email clicks
export function trackEmailClick(source: string): void {
  trackEvent('email_click', {
    event_category: 'conversion',
    event_label: source,
  });
}

// Track TripAdvisor link clicks
export function trackTripAdvisorClick(): void {
  trackEvent('tripadvisor_click', {
    event_category: 'engagement',
    event_label: 'reviews_section',
  });
}

// Track scroll depth (for long pages)
export function trackScrollDepth(percentage: number): void {
  trackEvent('scroll_depth', {
    event_category: 'engagement',
    depth_percentage: percentage,
  });
}

// Track when users view a list of items (destinations or tours listing page)
export function trackViewItemList(listType: 'destinations' | 'tours', itemCount: number): void {
  trackEvent('view_item_list', {
    event_category: 'engagement',
    item_list_id: listType,
    item_list_name: listType === 'destinations' ? 'Charter Flights' : 'Air Tours',
    item_count: itemCount,
  });
}

// Track navigation menu clicks
export function trackNavigation(linkName: string, location: 'header' | 'footer'): void {
  trackEvent('navigation_click', {
    event_category: 'navigation',
    link_name: linkName,
    location: location,
  });
}
