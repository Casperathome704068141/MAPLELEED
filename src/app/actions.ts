'use server';

import { generateConsultationSummary } from '@/ai/flows/generate-consultation-summary';
import { generateDocumentChecklist } from '@/ai/flows/generate-document-checklist';
import { findStudyOptions, FindStudyOptionsOutput } from '@/ai/flows/find-study-options';
import {
  AppointmentConflictError,
  AppointmentNotFoundError,
  AppointmentRecord,
  AppointmentStatus,
  createAppointment,
  setAppointmentStatus,
} from '@/lib/repositories/appointment-repository';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const summarySchema = z.object({
  studentBackground: z.string().min(10, { message: "Student background is too short." }),
  consultationNotes: z.string().min(10, { message: "Consultation notes are too short." }),
});

const checklistSchema = z.object({
  studentBackground: z.string().min(10, { message: "Student background is too short." }),
});

const studyOptionsSchema = z.object({
  query: z.string().min(5, { message: "Your search query is too short." }),
});

const bookingSchema = z.object({
  name: z.string().min(2, { message: 'Please provide your full name.' }),
  email: z.string().email({ message: 'Enter a valid email address.' }),
  date: z.string().min(1, { message: 'Please select a date.' }),
  time: z.string().min(1, { message: 'Please choose a time slot.' }),
});

const appointmentStatuses = ['Upcoming', 'Completed', 'Cancelled', 'Pending'] as const satisfies Readonly<
  AppointmentStatus[]
>;

const appointmentStatusSchema = z.object({
  appointmentId: z.string().uuid({ message: 'The appointment could not be identified.' }),
  status: z.enum(appointmentStatuses),
});

export type BookingFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: Record<string, string[]>;
  appointment?: AppointmentRecord;
};

export const bookingInitialState: BookingFormState = {
  status: 'idle',
};

function combineDateAndTime(date: string, timeLabel: string): string | null {
  const [yearStr, monthStr, dayStr] = date.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!year || !month || !day) {
    return null;
  }

  const timeMatch = timeLabel.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!timeMatch) {
    return null;
  }

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const period = timeMatch[3].toUpperCase();

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  const scheduled = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
  return scheduled.toISOString();
}

export async function handleGenerateSummary(prevState: any, formData: FormData) {
  try {
    const validatedFields = summarySchema.safeParse({
      studentBackground: formData.get('studentBackground'),
      consultationNotes: formData.get('consultationNotes'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Invalid form data.',
        errors: validatedFields.error.flatten().fieldErrors,
        data: null,
      };
    }

    const result = await generateConsultationSummary(validatedFields.data);
    return { message: 'success', data: result.summary, errors: null };
  } catch (error) {
    return { message: 'An error occurred while generating the summary.', errors: null, data: null };
  }
}

export async function handleGenerateChecklist(prevState: any, formData: FormData) {
  try {
    const validatedFields = checklistSchema.safeParse({
      studentBackground: formData.get('studentBackground'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Invalid form data.',
        errors: validatedFields.error.flatten().fieldErrors,
        data: null,
      };
    }

    const result = await generateDocumentChecklist(validatedFields.data);
    return { message: 'success', data: result.documentChecklist, errors: null };
  } catch (error) {
    return { message: 'An error occurred while generating the checklist.', errors: null, data: null };
  }
}

export async function handleFindStudyOptions(prevState: any, formData: FormData): Promise<{ message: string; data: FindStudyOptionsOutput | null; errors: any; }> {
  try {
    const validatedFields = studyOptionsSchema.safeParse({
      query: formData.get('query'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Invalid form data.',
        errors: validatedFields.error.flatten().fieldErrors,
        data: null,
      };
    }
    
    const result = await findStudyOptions(validatedFields.data);
    return { message: 'success', data: result, errors: null };
  } catch (error) {
    console.error(error);
    return { message: 'An error occurred while searching for study options.', errors: null, data: null };
  }
}

export async function bookConsultation(
  prevState: BookingFormState = bookingInitialState,
  formData: FormData,
): Promise<BookingFormState> {
  const validatedFields = bookingSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    date: formData.get('date'),
    time: formData.get('time'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Please correct the highlighted fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const scheduledFor = combineDateAndTime(validatedFields.data.date, validatedFields.data.time);

  if (!scheduledFor) {
    return {
      status: 'error',
      message: 'The selected date or time is invalid.',
      errors: {
        time: ['Please choose a valid time slot.'],
      },
    };
  }

  try {
    const appointment = await createAppointment({
      studentName: validatedFields.data.name,
      email: validatedFields.data.email,
      scheduledFor,
      timeSlotLabel: validatedFields.data.time,
      status: 'Upcoming',
    });

    return {
      status: 'success',
      message: 'Consultation booked successfully.',
      appointment,
    };
  } catch (error) {
    if (error instanceof AppointmentConflictError) {
      return {
        status: 'error',
        message: 'That time slot has already been booked. Please choose a different time.',
        errors: {
          time: ['This time slot has already been booked. Please pick another one.'],
        },
      };
    }

    console.error('Failed to create appointment', error);

    return {
      status: 'error',
      message: 'We could not save your booking. Please try again in a moment.',
    };
  }
}

export async function updateAppointmentStatus(formData: FormData) {
  const validatedFields = appointmentStatusSchema.safeParse({
    appointmentId: formData.get('appointmentId'),
    status: formData.get('status'),
  });

  const params = new URLSearchParams();

  if (!validatedFields.success) {
    params.set('error', validatedFields.error.errors[0]?.message ?? 'Unable to update the appointment status.');
    return redirectWithParams(params);
  }

  try {
    const appointment = await setAppointmentStatus(
      validatedFields.data.appointmentId,
      validatedFields.data.status,
    );

    params.set(
      'success',
      `Marked ${appointment.studentName}'s consultation as ${appointment.status}.`,
    );
    return redirectWithParams(params);
  } catch (error) {
    if (error instanceof AppointmentNotFoundError) {
      params.set('error', 'The selected appointment no longer exists.');
      return redirectWithParams(params);
    }

    console.error('Failed to update appointment status', error);
    params.set('error', 'We could not update the appointment status. Please try again.');
    return redirectWithParams(params);
  }
}

function redirectWithParams(params: URLSearchParams): never {
  revalidatePath('/admin/appointments');
  redirect(`/admin/appointments?${params.toString()}`);
}
