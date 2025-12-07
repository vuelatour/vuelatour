'use client';

import { useEffect, useState } from 'react';

export default function TripAdvisorReviewsWidget() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="cdsscrollingravewide"][src*="uniq=319"]');
    if (existingScript) return;

    // Load the TripAdvisor script after the widget div is in the DOM
    const script = document.createElement('script');
    script.src = 'https://www.jscache.com/wejs?wtype=cdsscrollingravewide&uniq=319&locationId=12135503&lang=en_US&border=true&shadow=false&display_version=2';
    script.async = true;
    script.setAttribute('data-loadtrk', '');
    script.onload = () => {
      (script as any).loadtrk = true;
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      id="TA_cdsscrollingravewide319"
      className="TA_cdsscrollingravewide"
      dangerouslySetInnerHTML={{
        __html: `
          <ul id="PP8hLtNCUcE" class="TA_links EtpadVtMLP">
            <li id="GdiLpk" class="QOgFqY">
              <a target="_blank" href="https://www.tripadvisor.com/Attraction_Review-g150807-d12135503-Reviews-Vuelatour-Cancun_Yucatan_Peninsula.html">
                <img src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_vertical.svg" alt="TripAdvisor" class="widEXCIMG" id="CDSWIDEXCLOGO"/>
              </a>
            </li>
          </ul>
        `
      }}
    />
  );
}
