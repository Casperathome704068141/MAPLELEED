// src/ai/flows/generate-consultation-summary.ts
'use server';

/**
 * @fileOverview Generates a structured summary of a consultation between a visa expert and a student.
 *
 * - generateConsultationSummary - A function that generates the consultation summary.
 * - GenerateConsultationSummaryInput - The input type for the generateConsultationSummary function.
 * - GenerateConsultationSummaryOutput - The return type for the generateConsultationSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConsultationSummaryInputSchema = z.object({
  studentBackground: z
    .string()
    .describe('Detailed background of the student, including education, work experience, and visa history.'),
  consultationNotes: z
    .string()
    .describe('Comprehensive notes taken during the consultation, including topics discussed and action items.'),
});
export type GenerateConsultationSummaryInput = z.infer<typeof GenerateConsultationSummaryInputSchema>;

const GenerateConsultationSummaryOutputSchema = z.object({
  summary: z.string().describe('A structured summary of the consultation, including key discussion points and agreed action plan.'),
});
export type GenerateConsultationSummaryOutput = z.infer<typeof GenerateConsultationSummaryOutputSchema>;

export async function generateConsultationSummary(
  input: GenerateConsultationSummaryInput
): Promise<GenerateConsultationSummaryOutput> {
  return generateConsultationSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConsultationSummaryPrompt',
  input: {
    schema: GenerateConsultationSummaryInputSchema,
  },
  output: {
    schema: GenerateConsultationSummaryOutputSchema,
  },
  prompt: `You are an AI assistant tasked with generating a structured summary of a visa consultation.

  Given the student's background and the consultation notes, create a concise and informative summary that includes key discussion points and the agreed-upon action plan.

  Student Background: {{{studentBackground}}}
  Consultation Notes: {{{consultationNotes}}}

  Summary:
`,
});

const generateConsultationSummaryFlow = ai.defineFlow(
  {
    name: 'generateConsultationSummaryFlow',
    inputSchema: GenerateConsultationSummaryInputSchema,
    outputSchema: GenerateConsultationSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
