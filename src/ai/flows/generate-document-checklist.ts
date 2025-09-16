'use server';

/**
 * @fileOverview AI flow to generate a tailored document checklist for students based on their background.
 *
 * - generateDocumentChecklist - A function that generates the document checklist.
 * - GenerateDocumentChecklistInput - The input type for the generateDocumentChecklist function.
 * - GenerateDocumentChecklistOutput - The return type for the generateDocumentChecklist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDocumentChecklistInputSchema = z.object({
  studentBackground: z
    .string()
    .describe(
      'Detailed background of the student including education, work experience, and visa history.'
    ),
});
export type GenerateDocumentChecklistInput = z.infer<
  typeof GenerateDocumentChecklistInputSchema
>;

const GenerateDocumentChecklistOutputSchema = z.object({
  documentChecklist: z
    .string()
    .describe(
      'A tailored checklist of documents the student needs to gather for their visa application.'
    ),
});
export type GenerateDocumentChecklistOutput = z.infer<
  typeof GenerateDocumentChecklistOutputSchema
>;

export async function generateDocumentChecklist(
  input: GenerateDocumentChecklistInput
): Promise<GenerateDocumentChecklistOutput> {
  return generateDocumentChecklistFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDocumentChecklistPrompt',
  input: {schema: GenerateDocumentChecklistInputSchema},
  output: {schema: GenerateDocumentChecklistOutputSchema},
  prompt: `You are an expert visa consultant. Based on the student's background, create a detailed document checklist they will need to gather for their visa application.

Student Background: {{{studentBackground}}}

Document Checklist:`,
});

const generateDocumentChecklistFlow = ai.defineFlow(
  {
    name: 'generateDocumentChecklistFlow',
    inputSchema: GenerateDocumentChecklistInputSchema,
    outputSchema: GenerateDocumentChecklistOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
