'use client';

import Script from 'next/script';

export default function TripAdvisorRatingWidget() {
  return (
    <>
      <div
        id="TA_cdsratingsonlywide189"
        className="TA_cdsratingsonlywide"
      >
        <ul id="7mLammCCH6" className="TA_links idW1MLUCRQ">
          <li id="gqcAMyOjN" className="u3TlvKLxRn">
            <a
              target="_blank"
              href="https://www.tripadvisor.com/Attraction_Review-g150807-d12135503-Reviews-Vuelatour-Cancun_Yucatan_Peninsula.html"
              rel="noopener noreferrer"
            >
              <img
                src="https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-18034-2.svg"
                alt="TripAdvisor"
              />
            </a>
          </li>
        </ul>
      </div>
      <Script
        src="https://www.jscache.com/wejs?wtype=cdsratingsonlywide&uniq=189&locationId=12135503&lang=en_US&border=true&display_version=2"
        strategy="lazyOnload"
        data-loadtrk=""
        onLoad={() => {
          console.log('TripAdvisor rating widget loaded');
        }}
      />
    </>
  );
}
