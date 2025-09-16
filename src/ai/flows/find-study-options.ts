'use server';

/**
 * @fileOverview AI flow to find study options (universities and courses) in Canada based on a user query.
 *
 * - findStudyOptions - A function that finds study options.
 * - FindStudyOptionsInput - The input type for the findStudyOptions function.
 * - FindStudyOptionsOutput - The return type for the findStudyOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindStudyOptionsInputSchema = z.object({
  query: z
    .string()
    .describe(
      'The user\'s query describing what they want to study in Canada. E.g., "masters in computer science in Ontario" or "bachelor of arts in British Columbia".'
    ),
});
export type FindStudyOptionsInput = z.infer<typeof FindStudyOptionsInputSchema>;

const CourseSchema = z.object({
  name: z.string().describe('The name of the course or program.'),
  level: z.string().describe('The academic level, e.g., "Bachelors", "Masters", "PhD", "Diploma".'),
  description: z.string().describe('A brief description of the course.'),
});

const UniversitySchema = z.object({
  name: z.string().describe('The name of the university or college.'),
  country: z.literal('Canada').describe('The country where the institution is located, which is always Canada.'),
  city: z.string().describe('The city where the institution is located.'),
  courses: z.array(CourseSchema).describe('A list of relevant courses offered by the institution.'),
});

const FindStudyOptionsOutputSchema = z.object({
  options: z.array(UniversitySchema).describe('A list of Canadian university/college and course recommendations.'),
});
export type FindStudyOptionsOutput = z.infer<typeof FindStudyOptionsOutputSchema>;

export async function findStudyOptions(
  input: FindStudyOptionsInput
): Promise<FindStudyOptionsOutput> {
  return findStudyOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findStudyOptionsPrompt',
  input: {
    schema: FindStudyOptionsInputSchema,
  },
  output: {
    schema: FindStudyOptionsOutputSchema,
  },
  prompt: `You are an expert Canadian educational consultant. A prospective student is looking for study options exclusively in Canada.

  Based on their query, provide a list of at least 3-5 relevant Canadian universities or colleges and specific courses that match their request. For each institution, provide the name, country (always Canada), city, and a list of courses with their name, level, and a brief description.

  Student Query: {{{query}}}
`,
});

const findStudyOptionsFlow = ai.defineFlow(
  {
    name: 'findStudyOptionsFlow',
    inputSchema: FindStudyOptionsInputSchema,
    outputSchema: FindStudyOptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
