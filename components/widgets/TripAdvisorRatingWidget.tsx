'use client';

export default function TripAdvisorRatingWidget() {
  return (
    <div className="flex justify-center">
      <iframe
        src="https://www.tripadvisor.com/WidgetEmbed-cdsratingsonlywide?locationId=12135503&lang=en_US&border=true&display_version=2"
        width="100%"
        height="80"
        frameBorder="0"
        scrolling="no"
        style={{ maxWidth: '300px' }}
        title="TripAdvisor Rating"
      />
    </div>
  );
}
