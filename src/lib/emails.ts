import { serverEnv } from './env/server';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const ADMIN_NOTIFICATION_EMAIL = 'anthonyluci69@gmail.com';

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

  const from = serverEnv.EMAIL_FROM_ADDRESS ?? 'MapleLeed <no-reply@mapleleed.com>';
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
  const recipients = new Set<string>();

  if (serverEnv.TEAM_NOTIFICATIONS_EMAIL) {
    recipients.add(serverEnv.TEAM_NOTIFICATIONS_EMAIL);
  }

  recipients.add(ADMIN_NOTIFICATION_EMAIL);

  if (recipients.size === 0) {
    return;
  }

  try {
    await deliverEmail({ ...payload, to: Array.from(recipients) });
  } catch (error) {
    console.warn('Team notification email failed', error);
  }
}

type IncidentPayload = {
  subject: string;
  message: string;
  context?: Record<string, string | number | null | undefined>;
  severity?: 'info' | 'warning' | 'critical';
};

export async function notifyAdminOfIncident(payload: IncidentPayload) {
  const contextEntries = Object.entries(payload.context ?? {}).filter(([, value]) => value !== undefined && value !== null);

  const textContext = contextEntries
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join('\n');

  const htmlContext = contextEntries
    .map(([key, value]) => `<li><strong>${key}:</strong> ${String(value)}</li>`)
    .join('');

  const subjectPrefix = payload.severity === 'critical' ? '[MapleLeed Critical]' : '[MapleLeed Alert]';

  await deliverTeamNotification({
    subject: `${subjectPrefix} ${payload.subject}`,
    text: `${payload.message}${textContext ? `\n\nContext:\n${textContext}` : ''}`,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><p>${payload.message}</p>${
      htmlContext ? `<ul>${htmlContext}</ul>` : ''
    }<p style="margin-top:24px">– MapleLeed System Monitor</p></body></html>`,
  });
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

  const subject = 'Your MapleLeed consultation is booked';
  const text = `Hi ${appointment.studentName},\n\nYour consultation is confirmed for ${formatted} (${appointment.timeSlotLabel}).\nWe will reach out with any updates.\n\n– MapleLeed Team`;

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><p>Hi ${appointment.studentName},</p><p>Your consultation is confirmed for <strong>${formatted}</strong> (${appointment.timeSlotLabel}).</p><p>If you need to make changes, reply to this email and our team will help you reschedule.</p><p style="margin-top:24px">– The MapleLeed Team</p></body></html>`;

  await deliverEmail({ to: appointment.email, subject, text, html });

  const teamSubject = `Consultation booking confirmed — ${appointment.studentName}`;
  const teamMessage = `A student scheduled a MapleLeed planning call. Track the booking inside the admin portal.`;
  const teamDetails = {
    'Student name': appointment.studentName,
    'Student email': appointment.email,
    When: formatted,
    'Time slot label': appointment.timeSlotLabel,
    Channel: 'Website consultation form',
  } as const;

  await notifyAdminOfIncident({
    subject: teamSubject,
    message: teamMessage,
    context: teamDetails,
    severity: 'info',
  });
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

  const subject = 'MapleLeed study service payment confirmed';
  const text = `Hi ${order.customerName ?? 'there'},\n\nThanks for choosing MapleLeed. We received ${formatter.format(order.amount / 100)} for the ${order.planName} plan.\nReference: ${order.checkoutReference}.`;

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><p>Hi ${order.customerName ?? 'there'},</p><p>Thanks for choosing MapleLeed. We received <strong>${formatter.format(order.amount / 100)}</strong> for the <strong>${order.planName}</strong> plan.</p>${addonsSection}<p>Reference: <strong>${order.checkoutReference}</strong></p><p style="margin-top:24px">We will contact you within one business day with next steps.</p><p style="margin-top:24px">– The MapleLeed Team</p></body></html>`;

  await deliverEmail({
    to: order.customerEmail,
    subject,
    text,
    html,
  });

  await notifyAdminOfIncident({
    subject: `Study plan payment confirmed — ${order.planName}`,
    message: 'Stripe reported a successful MapleLeed study package payment.',
    context: {
      'Customer name': order.customerName ?? 'Unknown',
      'Customer email': order.customerEmail ?? 'n/a',
      Plan: order.planName,
      Amount: formatter.format(order.amount / 100),
      Addons: order.addons.length ? order.addons.join(', ') : 'None',
      'Checkout reference': order.checkoutReference,
    },
    severity: 'info',
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
  const currency = order.currency.toUpperCase();
  const subject = 'Your MapleLeed travel itinerary';
  const text = `Hi ${order.customerName ?? 'traveller'},\n\nYour booking (${order.bookingReference}) has been placed. Duffel order: ${order.orderId}. Total: ${order.totalAmount} ${currency}.`;
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><p>Hi ${order.customerName ?? 'traveller'},</p><p>Your flight booking is confirmed.</p><ul><li><strong>Booking reference:</strong> ${order.bookingReference}</li><li><strong>Duffel order:</strong> ${order.orderId}</li><li><strong>Total charged:</strong> ${order.totalAmount} ${currency}</li></ul><p>We will send your e-ticket once the airline releases it.</p><p style="margin-top:24px">Safe travels!<br/>– The MapleLeed Team</p></body></html>`;

  await deliverEmail({ to: order.contactEmail, subject, text, html });

  await notifyAdminOfIncident({
    subject: `Travel reservation completed — ${order.bookingReference}`,
    message: 'A MapleLeed travel itinerary has been booked through Duffel.',
    context: {
      Traveller: order.customerName ?? 'Unknown',
      Email: order.contactEmail,
      'Booking reference': order.bookingReference,
      'Duffel order ID': order.orderId,
      Total: `${order.totalAmount} ${currency}`,
    },
    severity: 'info',
  });
}
