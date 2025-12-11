import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend only when needed (at runtime, not build time)
function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface QuoteRequestData {
  // Contact info
  name: string;
  email: string;
  phone: string;
  message?: string;

  // Service type
  service_type: 'charter' | 'tour';

  // Charter specific
  destination?: string;
  destination_other?: string;
  departure_location?: string;
  departure_location_other?: string;
  travel_date?: string;
  departure_time?: string;
  return_date?: string;
  return_time?: string;
  aircraft_selected?: string;

  // Tour specific
  tour?: string;
  number_of_passengers?: number;

  // Pre-selected info
  preSelectedPrice?: string;
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'No especificada';
  // Extract just the date part (YYYY-MM-DD) to avoid any timezone conversion
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);

  // Format manually to avoid any timezone issues
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const weekdays = [
    'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
  ];

  // Create date at noon to avoid any edge cases
  const date = new Date(year, month - 1, day, 12, 0, 0);
  const weekday = weekdays[date.getDay()];
  const monthName = months[month - 1];

  return `${weekday}, ${day} de ${monthName} de ${year}`;
}

function formatSlug(slug: string): string {
  return slug.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function generateEmailHTML(data: QuoteRequestData): string {
  const isCharter = data.service_type === 'charter';
  const serviceTypeLabel = isCharter ? 'Vuelo Privado (Charter)' : 'Tour Aéreo';

  const departureLocation = data.departure_location === 'other'
    ? data.departure_location_other
    : data.departure_location;

  const destination = data.destination === 'other'
    ? data.destination_other
    : data.destination ? formatSlug(data.destination) : '';

  const tour = data.tour ? formatSlug(data.tour) : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Solicitud de Cotización - Vuelatour</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #102a43; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                Nueva Solicitud de Cotización
              </h1>
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 14px;">
                ${serviceTypeLabel}
              </p>
            </td>
          </tr>

          <!-- Badge -->
          <tr>
            <td style="padding: 20px 40px 0 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="background-color: ${isCharter ? '#dbeafe' : '#dcfce7'}; color: ${isCharter ? '#1e40af' : '#166534'}; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-align: center;">
                    ${isCharter ? '✈️ VUELO PRIVADO' : '🎯 TOUR AÉREO'}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Client Info Section -->
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <h2 style="margin: 0 0 15px 0; color: #102a43; font-size: 16px; font-weight: 600; border-bottom: 2px solid #e63946; padding-bottom: 8px;">
                👤 Información del Cliente
              </h2>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 140px;">Nombre:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">
                    <a href="mailto:${data.email}" style="color: #e63946; text-decoration: none;">${data.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Teléfono:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">
                    <a href="tel:${data.phone}" style="color: #e63946; text-decoration: none;">${data.phone}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Trip Details Section -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <h2 style="margin: 0 0 15px 0; color: #102a43; font-size: 16px; font-weight: 600; border-bottom: 2px solid #e63946; padding-bottom: 8px;">
                ${isCharter ? '🛫 Detalles del Vuelo' : '🎫 Detalles del Tour'}
              </h2>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${isCharter ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 140px;">Origen:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${departureLocation || 'No especificado'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Destino:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${destination || 'No especificado'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Fecha de ida:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${formatDate(data.travel_date)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Hora de salida:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${data.departure_time || 'No especificada'}</td>
                </tr>
                ${data.return_date ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Fecha de regreso:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${formatDate(data.return_date)}</td>
                </tr>
                ${data.return_time ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Hora de regreso:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${data.return_time}</td>
                </tr>
                ` : ''}
                ` : ''}
                ${data.aircraft_selected ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Aeronave:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${data.aircraft_selected}</td>
                </tr>
                ` : ''}
                ` : `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 140px;">Tour:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${tour}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Pasajeros:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${data.number_of_passengers || 'No especificado'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Fecha:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${formatDate(data.travel_date)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Hora:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${data.departure_time || 'No especificada'}</td>
                </tr>
                `}
                ${data.preSelectedPrice ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Precio cotizado:</td>
                  <td style="padding: 8px 0; color: #e63946; font-size: 14px; font-weight: 600;">Desde $${data.preSelectedPrice} USD</td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Message Section (if exists) -->
          ${data.message ? `
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h2 style="margin: 0 0 15px 0; color: #102a43; font-size: 16px; font-weight: 600; border-bottom: 2px solid #e63946; padding-bottom: 8px;">
                💬 Mensaje del Cliente
              </h2>
              <div style="background-color: #f8fafc; border-left: 4px solid #e63946; padding: 15px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">${data.message}</p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- CTA Section -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="mailto:${data.email}?subject=Re: Cotización Vuelatour - ${isCharter ? destination : tour}" style="display: inline-block; background-color: #e63946; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      Responder al Cliente
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}" style="display: inline-block; background-color: #25d366; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 13px;">
                      💬 Contactar por WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                Este correo fue generado automáticamente desde el formulario de contacto de
                <a href="https://vuelatour.com" style="color: #e63946; text-decoration: none;">vuelatour.com</a>
              </p>
              <p style="margin: 8px 0 0 0; color: #cbd5e1; font-size: 11px;">
                © ${new Date().getFullYear()} Vuelatour. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const data: QuoteRequestData = await request.json();

    const isCharter = data.service_type === 'charter';
    const destination = data.destination === 'other' ? data.destination_other : data.destination;
    const tour = data.tour;

    const subject = isCharter
      ? `Nueva Cotización: Vuelo a ${destination ? formatSlug(destination) : 'destino personalizado'} - ${data.name}`
      : `Nueva Cotización: Tour ${tour ? formatSlug(tour) : 'aéreo'} - ${data.name}`;

    const resend = getResendClient();
    const { data: emailData, error } = await resend.emails.send({
      from: 'Vuelatour Notificaciones <notificaciones@notify.vuelatour.com>',
      to: ['info@vuelatour.com'],
      subject: subject,
      html: generateEmailHTML(data),
      replyTo: data.email,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Error al enviar notificación' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: emailData?.id });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
