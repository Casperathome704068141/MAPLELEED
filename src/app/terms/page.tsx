import type { Metadata } from 'next';

import TermsContent from './terms-content';

export const metadata: Metadata = {
  title: 'Terms of Service | VisaPilot',
  description:
    'Understand the service commitments, responsibilities, and acceptable use policies that govern your relationship with VisaPilot.',
};

export default function TermsPage() {
  return <TermsContent />;
}
