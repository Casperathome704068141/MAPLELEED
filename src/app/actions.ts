'use server';

import { generateConsultationSummary } from '@/ai/flows/generate-consultation-summary';
import { generateDocumentChecklist } from '@/ai/flows/generate-document-checklist';
import { findStudyOptions, FindStudyOptionsOutput } from '@/ai/flows/find-study-options';
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
