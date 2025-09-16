'use server';

import { generateConsultationSummary } from '@/ai/flows/generate-consultation-summary';
import { generateDocumentChecklist } from '@/ai/flows/generate-document-checklist';
import { z } from 'zod';

const summarySchema = z.object({
  studentBackground: z.string().min(10, { message: "Student background is too short." }),
  consultationNotes: z.string().min(10, { message: "Consultation notes are too short." }),
});

const checklistSchema = z.object({
  studentBackground: z.string().min(10, { message: "Student background is too short." }),
});

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
      };
    }

    const result = await generateConsultationSummary(validatedFields.data);
    return { message: 'success', data: result.summary };
  } catch (error) {
    return { message: 'An error occurred while generating the summary.' };
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
      };
    }

    const result = await generateDocumentChecklist(validatedFields.data);
    return { message: 'success', data: result.documentChecklist };
  } catch (error) {
    return { message: 'An error occurred while generating the checklist.' };
  }
}
