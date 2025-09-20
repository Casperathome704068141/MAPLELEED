import { Timestamp } from 'firebase-admin/firestore';

import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { serverEnv } from '@/lib/env/server';
import { sendAppointmentConfirmationEmail } from '@/lib/emails';

export type AppointmentStatus = 'Upcoming' | 'Completed' | 'Cancelled' | 'Pending';

export type AppointmentRecord = {
  id: string;
  studentName: string;
  email: string;
  scheduledFor: string;
  timeSlotLabel: string;
  status: AppointmentStatus;
  createdAt: string;
};

type AppointmentInput = {
  studentName: string;
  email: string;
  scheduledFor: string;
  timeSlotLabel: string;
  status?: AppointmentStatus;
};

type AppointmentDocument = {
  studentName: string;
  email: string;
  scheduledFor: Timestamp;
  timeSlotLabel: string;
  status: AppointmentStatus;
  createdAt: Timestamp;
};

const collectionName = serverEnv.FIREBASE_APPOINTMENTS_COLLECTION;

function mapAppointment(docId: string, data: AppointmentDocument): AppointmentRecord {
  return {
    id: docId,
    studentName: data.studentName,
    email: data.email,
    scheduledFor: data.scheduledFor.toDate().toISOString(),
    timeSlotLabel: data.timeSlotLabel,
    status: data.status,
    createdAt: data.createdAt.toDate().toISOString(),
  };
}

export async function listAppointments(): Promise<AppointmentRecord[]> {
  const firestore = getFirebaseAdminFirestore();
  const snapshot = await firestore
    .collection(collectionName)
    .orderBy('scheduledFor', 'asc')
    .get();

  return snapshot.docs.map(doc => mapAppointment(doc.id, doc.data() as AppointmentDocument));
}

export async function createAppointment(input: AppointmentInput): Promise<AppointmentRecord> {
  const firestore = getFirebaseAdminFirestore();
  const now = Timestamp.now();
  const scheduledTimestamp = Timestamp.fromDate(new Date(input.scheduledFor));

  const docRef = await firestore.collection(collectionName).add({
    studentName: input.studentName,
    email: input.email,
    scheduledFor: scheduledTimestamp,
    timeSlotLabel: input.timeSlotLabel,
    status: input.status ?? 'Upcoming',
    createdAt: now,
  });

  const appointment = mapAppointment(docRef.id, {
    studentName: input.studentName,
    email: input.email,
    scheduledFor: scheduledTimestamp,
    timeSlotLabel: input.timeSlotLabel,
    status: input.status ?? 'Upcoming',
    createdAt: now,
  });

  await sendAppointmentConfirmationEmail(appointment).catch(error => {
    console.warn('Appointment confirmation email failed', error);
  });

  return appointment;
}
