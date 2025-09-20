import { serverEnv } from './env/server';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

type EmailPayload = {
  to: string | string[];
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
  const recipients = Array.isArray(payload.to)
    ? Array.from(new Set(payload.to.filter(Boolean)))
    : [payload.to];

  if (recipients.length === 0) {
    return;
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: recipients,
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

async function deliverTeamNotification(payload: Omit<EmailPayload, 'to'>) {
  const recipient = serverEnv.TEAM_NOTIFICATIONS_EMAIL;

  if (!recipient) {
    return;
  }

  try {
    await deliverEmail({ ...payload, to: recipient });
  } catch (error) {
    console.warn('Team notification email failed', error);
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

  const teamSubject = `New consultation booking – ${appointment.studentName}`;
  const teamText = `A consultation was booked for ${appointment.studentName} (${appointment.email}) on ${formatted} (${appointment.timeSlotLabel}).`;
  const teamHtml = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><p><strong>New consultation booked</strong></p><ul><li><strong>Student:</strong> ${appointment.studentName}</li><li><strong>Email:</strong> ${appointment.email}</li><li><strong>Scheduled:</strong> ${formatted} (${appointment.timeSlotLabel})</li></ul><p>View the appointment in the admin dashboard for more details.</p></body></html>`;

  await deliverTeamNotification({ subject: teamSubject, text: teamText, html: teamHtml });
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

  const teamSubject = `Study plan payment confirmed – ${order.planName}`;
  const teamText = `Payment of ${formatter.format(order.amount / 100)} captured for ${order.planName}. Customer: ${order.customerName ?? 'Unknown'} (${order.customerEmail ?? 'no email'}). Reference ${order.checkoutReference}.`;
  const teamHtml = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><p><strong>Study package payment recorded</strong></p><ul><li><strong>Plan:</strong> ${order.planName}</li><li><strong>Amount:</strong> ${formatter.format(order.amount / 100)}</li><li><strong>Customer:</strong> ${order.customerName ?? 'Unknown'} (${order.customerEmail ?? 'n/a'})</li><li><strong>Checkout reference:</strong> ${order.checkoutReference}</li></ul><p>You can review the order details in the admin dashboard.</p></body></html>`;

  await deliverTeamNotification({ subject: teamSubject, text: teamText, html: teamHtml });
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
  const currency = order.currency.toUpperCase();
  const subject = 'Your VisaPilot travel itinerary';
  const text = `Hi ${order.customerName ?? 'traveller'},\n\nYour booking (${order.bookingReference}) has been placed. Duffel order: ${order.orderId}. Total: ${order.totalAmount} ${currency}.`;
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><p>Hi ${order.customerName ?? 'traveller'},</p><p>Your flight booking is confirmed.</p><ul><li><strong>Booking reference:</strong> ${order.bookingReference}</li><li><strong>Duffel order:</strong> ${order.orderId}</li><li><strong>Total charged:</strong> ${order.totalAmount} ${currency}</li></ul><p>We will send your e-ticket once the airline releases it.</p><p style="margin-top:24px">Safe travels!<br/>– The VisaPilot Team</p></body></html>`;

  await deliverEmail({ to: order.contactEmail, subject, text, html });

  const teamSubject = `Travel reservation completed – ${order.bookingReference}`;
  const teamText = `Travel order ${order.orderId} confirmed for ${order.customerName ?? 'traveller'} (${order.contactEmail}). Total ${order.totalAmount} ${currency}.`;
  const teamHtml = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><p><strong>Travel booking finalised</strong></p><ul><li><strong>Customer:</strong> ${order.customerName ?? 'Unknown'} (${order.contactEmail})</li><li><strong>Duffel order ID:</strong> ${order.orderId}</li><li><strong>Booking reference:</strong> ${order.bookingReference}</li><li><strong>Total amount:</strong> ${order.totalAmount} ${currency}</li></ul><p>Check Duffel for ticket issuance status.</p></body></html>`;

  await deliverTeamNotification({ subject: teamSubject, text: teamText, html: teamHtml });
}
