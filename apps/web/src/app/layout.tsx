import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: { default: 'UdyogaSakha', template: '%s | UdyogaSakha' },
  description: 'Foundation-governed Udyoga facilitation ecosystem — connecting opportunity seekers and providers under a transparent trust framework.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
