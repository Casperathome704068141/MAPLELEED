import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';

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

export class AppointmentRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppointmentRepositoryError';
  }
}

export class AppointmentConflictError extends AppointmentRepositoryError {
  constructor(message = 'That appointment time has already been booked.') {
    super(message);
    this.name = 'AppointmentConflictError';
  }
}

export class AppointmentNotFoundError extends AppointmentRepositoryError {
  constructor(message = 'Appointment not found.') {
    super(message);
    this.name = 'AppointmentNotFoundError';
  }
}

const DATA_DIRECTORY = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIRECTORY, 'appointments.json');

async function ensureStorage() {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf8');
  }
}

async function readAppointments(): Promise<AppointmentRecord[]> {
  await ensureStorage();
  const fileContents = await fs.readFile(DATA_FILE, 'utf8');

  try {
    const parsed = JSON.parse(fileContents);
    if (Array.isArray(parsed)) {
      return parsed as AppointmentRecord[];
    }

    return [];
  } catch {
    return [];
  }
}

async function writeAppointments(appointments: AppointmentRecord[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(appointments, null, 2), 'utf8');
}

export async function listAppointments(): Promise<AppointmentRecord[]> {
  const appointments = await readAppointments();
  return appointments
    .slice()
    .sort(
      (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime(),
    );
}

export async function createAppointment(input: AppointmentInput): Promise<AppointmentRecord> {
  const appointments = await readAppointments();

  if (appointments.some((appointment) => appointment.scheduledFor === input.scheduledFor)) {
    throw new AppointmentConflictError();
  }

  const now = new Date();

  const appointment: AppointmentRecord = {
    id: randomUUID(),
    studentName: input.studentName,
    email: input.email,
    scheduledFor: input.scheduledFor,
    timeSlotLabel: input.timeSlotLabel,
    status: input.status ?? 'Upcoming',
    createdAt: now.toISOString(),
  };

  appointments.push(appointment);
  await writeAppointments(appointments);

  return appointment;
}

export async function setAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<AppointmentRecord> {
  const appointments = await readAppointments();
  const index = appointments.findIndex((appointment) => appointment.id === id);

  if (index === -1) {
    throw new AppointmentNotFoundError();
  }

  const updatedAppointment: AppointmentRecord = {
    ...appointments[index],
    status,
  };

  appointments[index] = updatedAppointment;
  await writeAppointments(appointments);

  return updatedAppointment;
}
