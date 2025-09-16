import { config } from 'dotenv';
config();

import '@/ai/flows/generate-consultation-summary.ts';
import '@/ai/flows/generate-document-checklist.ts';
import '@/ai/flows/find-study-options.ts';
