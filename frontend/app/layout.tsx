import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import './globals.css';

export const metadata: Metadata = {
  title: 'RiceShare | Surplus-Food Marketplace Sri Lanka',
  description: 'Connect surplus food with people who need it. Sell it at a discount or donate it for free. Sell it. Share it. Save it.',
  keywords: ['surplus food', 'Sri Lanka', 'food rescue', 'food waste reduction', 'discount food', 'food donation', 'Malabe', 'Colombo'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-100 selection:text-amber-900">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: '#d97706',
            },
          }}
        >
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <ChatBot />
        </ClerkProvider>
      </body>
    </html>
  );
}
