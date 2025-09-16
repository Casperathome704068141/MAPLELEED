'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handleGenerateSummary } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  message: '',
  errors: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      Generate Summary
    </Button>
  );
}

export default function ConsultationSummaryGenerator() {
  const [state, formAction] = useFormState(handleGenerateSummary, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message === 'success' && state.data) {
        toast({ title: 'Summary Generated!', description: 'The consultation summary is ready for review.' });
        formRef.current?.reset();
    } else if (state.message && state.message !== 'success') {
        toast({ title: 'Error', description: state.message, variant: 'destructive' });
    }
  }, [state, toast]);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate Consultation Summary</CardTitle>
          <CardDescription>
            Input the student's background and consultation notes to generate a structured summary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="studentBackground">Student Background</Label>
              <Textarea
                id="studentBackground"
                name="studentBackground"
                placeholder="E.g., Bachelor's in Computer Science from University of Mumbai, 2 years experience as a software developer..."
                className="min-h-[120px]"
                required
              />
              {state.errors?.studentBackground && (
                <p className="text-sm text-destructive mt-1">{state.errors.studentBackground[0]}</p>
              )}
            </div>
            <div>
              <Label htmlFor="consultationNotes">Consultation Notes</Label>
              <Textarea
                id="consultationNotes"
                name="consultationNotes"
                placeholder="E.g., Discussed F-1 visa requirements, financial documentation, and interview preparation..."
                className="min-h-[120px]"
                required
              />
               {state.errors?.consultationNotes && (
                <p className="text-sm text-destructive mt-1">{state.errors.consultationNotes[0]}</p>
              )}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Generated Summary</CardTitle>
          <CardDescription>Review and edit the AI-generated summary below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none rounded-md border bg-secondary/50 p-4 min-h-[280px]">
            {state.data ? (
                <Textarea defaultValue={state.data} className="w-full h-full bg-transparent border-none p-0 focus-visible:ring-0" />
            ) : (
              <p className="text-muted-foreground">The generated summary will appear here.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
