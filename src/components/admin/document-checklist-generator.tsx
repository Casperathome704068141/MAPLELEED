'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handleGenerateChecklist } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, FileCheck } from 'lucide-react';
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
      Generate Checklist
    </Button>
  );
}

export default function DocumentChecklistGenerator() {
  const [state, formAction] = useFormState(handleGenerateChecklist, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message === 'success' && state.data) {
        toast({ title: 'Checklist Generated!', description: 'The document checklist is ready.' });
        formRef.current?.reset();
    } else if (state.message && state.message !== 'success') {
        toast({ title: 'Error', description: state.message, variant: 'destructive' });
    }
  }, [state, toast]);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate Document Checklist</CardTitle>
          <CardDescription>
            Input the student's background to generate a tailored document checklist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="studentBackground">Student Background</Label>
              <Textarea
                id="studentBackground"
                name="studentBackground"
                placeholder="E.g., Applying for Masters in Data Science in the US. Undergrad in Electrical Engineering. No prior travel history..."
                className="min-h-[120px]"
                required
              />
               {state.errors?.studentBackground && (
                <p className="text-sm text-destructive mt-1">{state.errors.studentBackground[0]}</p>
              )}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Generated Checklist</CardTitle>
          <CardDescription>A tailored list of required documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none rounded-md border bg-secondary/50 p-4 min-h-[200px]">
            {state.data ? (
              <div className="whitespace-pre-wrap">{state.data}</div>
            ) : (
              <p className="text-muted-foreground">The generated checklist will appear here.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
