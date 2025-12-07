'use client';

export default function TripAdvisorReviewsWidget() {
  return (
    <div className="flex justify-center w-full">
      <iframe
        src="https://www.tripadvisor.com/WidgetEmbed-cdsscrollingravewide?locationId=12135503&lang=en_US&border=true&shadow=false&display_version=2"
        width="100%"
        height="450"
        frameBorder="0"
        scrolling="no"
        style={{ maxWidth: '600px' }}
        title="TripAdvisor Reviews"
      />
    </div>
  );
}
