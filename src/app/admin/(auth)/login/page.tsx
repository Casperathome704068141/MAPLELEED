
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email')?.toString().trim() ?? '';
    const password = formData.get('password')?.toString() ?? '';

    if (!email || !password) {
      setError('Email and password are required.');
      setSubmitting(false);
      return;
    }

    try {
      const auth = getAuth(app);
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credentials.user.getIdToken();

      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Unable to start admin session.' }));
        throw new Error(payload.error ?? 'Unable to start admin session.');
      }

      router.replace('/admin');
    } catch (authError: any) {
      console.error('Admin login failed', authError);
      const message = authError?.message ?? 'Unable to sign in. Check your credentials and try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-headline">Admin access</CardTitle>
          <CardDescription>
            Sign in with your VisaPilot admin credentials. Access is restricted to the authorised administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Unable to sign in</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Verifying
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Lost access? Contact the VisaPilot engineering team to reset admin credentials.
          </p>
          <div className="mt-6 text-center text-sm">
            <Link href="/" className="text-primary hover:underline">
              Return to homepage
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
