'use client';

import { useFormStatus } from 'react-dom';
import { handleGenerateSummary } from '@/app/actions';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  message: '',
  errors: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Summary
        </>
      )}
    </Button>
  );
}

export default function ConsultationSummaryGenerator() {
  const [state, formAction] = useActionState(handleGenerateSummary, initialState);
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
      <form ref={formRef} action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="studentBackground">Student Background</Label>
          <Textarea
            id="studentBackground"
            name="studentBackground"
            placeholder="E.g., Bachelor's in Computer Science from University of Mumbai, 2 years experience as a software developer..."
            className="min-h-[150px]"
            required
          />
          {state.errors?.studentBackground && (
            <p className="text-sm text-destructive mt-1">{state.errors.studentBackground[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="consultationNotes">Consultation Notes</Label>
          <Textarea
            id="consultationNotes"
            name="consultationNotes"
            placeholder="E.g., Discussed F-1 visa requirements, financial documentation, and interview preparation..."
            className="min-h-[150px]"
            required
          />
           {state.errors?.consultationNotes && (
            <p className="text-sm text-destructive mt-1">{state.errors.consultationNotes[0]}</p>
          )}
        </div>
        <SubmitButton />
      </form>
      
      <div className="space-y-2">
        <Label htmlFor="generatedSummary">Generated Summary</Label>
        <div className="prose prose-sm max-w-none rounded-md border bg-secondary/50 p-4 min-h-[358px]">
            {state.data ? (
                <Textarea id="generatedSummary" defaultValue={state.data} className="w-full h-full bg-transparent border-none p-0 focus-visible:ring-0" />
            ) : (
              <p className="text-muted-foreground">The generated summary will appear here.</p>
            )}
        </div>
      </div>
    </div>
  );
}
