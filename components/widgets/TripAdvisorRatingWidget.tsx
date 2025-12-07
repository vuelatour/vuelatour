'use client';

import { useEffect, useState } from 'react';

export default function TripAdvisorRatingWidget() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="cdsratingsonlywide"][src*="uniq=189"]');
    if (existingScript) return;

    // Load the TripAdvisor script after the widget div is in the DOM
    const script = document.createElement('script');
    script.src = 'https://www.jscache.com/wejs?wtype=cdsratingsonlywide&uniq=189&locationId=12135503&lang=en_US&border=true&display_version=2';
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
      id="TA_cdsratingsonlywide189"
      className="TA_cdsratingsonlywide"
      dangerouslySetInnerHTML={{
        __html: `
          <ul id="7mLammCCH6" class="TA_links idW1MLUCRQ">
            <li id="gqcAMyOjN" class="u3TlvKLxRn">
              <a target="_blank" href="https://www.tripadvisor.com/Attraction_Review-g150807-d12135503-Reviews-Vuelatour-Cancun_Yucatan_Peninsula.html">
                <img src="https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-18034-2.svg" alt="TripAdvisor"/>
              </a>
            </li>
          </ul>
        `
      }}
    />
  );
}
