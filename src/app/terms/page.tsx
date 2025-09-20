import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | MapleLeed',
  description:
    'Understand the service commitments, responsibilities, and acceptable use policies that govern your relationship with MapleLeed.',
};

import TermsContent from './terms-content';

export default function TermsPage() {
  return <TermsContent />;
}
