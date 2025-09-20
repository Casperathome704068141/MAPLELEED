import { serverEnv } from './env/server';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

async function deliverEmail(payload: EmailPayload) {
  if (!serverEnv.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not configured. Skipping email to %s.', payload.to);
    return;
  }

  const from = serverEnv.EMAIL_FROM_ADDRESS ?? 'VisaPilot <no-reply@visapilot.com>';

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to send email: ${response.status} ${errorBody}`);
  }
}

type AppointmentEmail = {
  studentName: string;
  email: string;
  scheduledFor: string;
  timeSlotLabel: string;
};

export async function sendAppointmentConfirmationEmail(appointment: AppointmentEmail) {
  const scheduledDate = new Date(appointment.scheduledFor);
  const formatted = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(scheduledDate);

  const subject = 'Your VisaPilot consultation is booked';
  const text = `Hi ${appointment.studentName},\n\nYour consultation is confirmed for ${formatted} (${appointment.timeSlotLabel}).\nWe will reach out with any updates.\n\n– VisaPilot Team`;

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><p>Hi ${appointment.studentName},</p><p>Your consultation is confirmed for <strong>${formatted}</strong> (${appointment.timeSlotLabel}).</p><p>If you need to make changes, reply to this email and our team will help you reschedule.</p><p style="margin-top:24px">– The VisaPilot Team</p></body></html>`;

  await deliverEmail({ to: appointment.email, subject, text, html });
}

type StudyOrderEmail = {
  customerEmail?: string | null;
  customerName?: string | null;
  planName: string;
  addons: string[];
  amount: number;
  currency: string;
  checkoutReference: string;
};

export async function sendStudyOrderReceipt(order: StudyOrderEmail) {
  if (!order.customerEmail) {
    return;
  }

  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: order.currency.toUpperCase(),
  });

  const addonsSection = order.addons.length
    ? `<p>Add-ons: ${order.addons.join(', ')}</p>`
    : '<p>No add-ons selected.</p>';

  const subject = 'VisaPilot study service payment confirmed';
  const text = `Hi ${order.customerName ?? 'there'},\n\nThanks for choosing VisaPilot. We received ${formatter.format(order.amount / 100)} for the ${order.planName} plan.\nReference: ${order.checkoutReference}.`;

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><p>Hi ${order.customerName ?? 'there'},</p><p>Thanks for choosing VisaPilot. We received <strong>${formatter.format(order.amount / 100)}</strong> for the <strong>${order.planName}</strong> plan.</p>${addonsSection}<p>Reference: <strong>${order.checkoutReference}</strong></p><p style="margin-top:24px">We will contact you within one business day with next steps.</p><p style="margin-top:24px">– The VisaPilot Team</p></body></html>`;

  await deliverEmail({
    to: order.customerEmail,
    subject,
    text,
    html,
  });
}

type TravelOrderEmail = {
  contactEmail: string;
  customerName?: string | null;
  bookingReference: string;
  orderId: string;
  totalAmount: string;
  currency: string;
};

export async function sendTravelOrderEmail(order: TravelOrderEmail) {
  const subject = 'Your VisaPilot travel itinerary';
  const text = `Hi ${order.customerName ?? 'traveller'},\n\nYour booking (${order.bookingReference}) has been placed. Duffel order: ${order.orderId}. Total: ${order.totalAmount} ${order.currency}.`;
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><p>Hi ${order.customerName ?? 'traveller'},</p><p>Your flight booking is confirmed.</p><ul><li><strong>Booking reference:</strong> ${order.bookingReference}</li><li><strong>Duffel order:</strong> ${order.orderId}</li><li><strong>Total charged:</strong> ${order.totalAmount} ${order.currency}</li></ul><p>We will send your e-ticket once the airline releases it.</p><p style="margin-top:24px">Safe travels!<br/>– The VisaPilot Team</p></body></html>`;

  await deliverEmail({ to: order.contactEmail, subject, text, html });
}
