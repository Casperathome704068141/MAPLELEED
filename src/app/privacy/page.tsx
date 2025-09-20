import type { Metadata } from 'next';

import PrivacyContent from './privacy-content';

export const metadata: Metadata = {
  title: 'Privacy Policy | VisaPilot',
  description:
    'Learn how VisaPilot collects, safeguards, and uses the information you share while planning your Canadian study journey.',
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
