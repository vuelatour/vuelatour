'use client';

import Script from 'next/script';

export default function TripAdvisorReviewsWidget() {
  return (
    <>
      <div
        id="TA_cdsscrollingravewide319"
        className="TA_cdsscrollingravewide"
      >
        <ul id="PP8hLtNCUcE" className="TA_links EtpadVtMLP">
          <li id="GdiLpk" className="QOgFqY">
            <a
              target="_blank"
              href="https://www.tripadvisor.com/Attraction_Review-g150807-d12135503-Reviews-Vuelatour-Cancun_Yucatan_Peninsula.html"
              rel="noopener noreferrer"
            >
              <img
                src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_vertical.svg"
                alt="TripAdvisor"
                className="widEXCIMG"
                id="CDSWIDEXCLOGO"
              />
            </a>
          </li>
        </ul>
      </div>
      <Script
        src="https://www.jscache.com/wejs?wtype=cdsscrollingravewide&uniq=319&locationId=12135503&lang=en_US&border=true&shadow=false&display_version=2"
        strategy="lazyOnload"
        data-loadtrk=""
        onLoad={() => {
          console.log('TripAdvisor reviews widget loaded');
        }}
      />
    </>
  );
}
