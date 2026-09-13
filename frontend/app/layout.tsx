import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import OrcaChatbot from '@/components/OrcaChatbot';
import { LocationLanguageProvider } from '@/context/LocationLanguageContext';

export const metadata: Metadata = {
  title: 'ORCA — Marine Ecosystem Reasoning with Collaborative Agents',
  description: 'Agentic AI-powered marine intelligence & decision-support platform for safe navigation, fishing, and oceanographic reasoning.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-cyan-500 selection:text-slate-950">
        <LocationLanguageProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <OrcaChatbot />
          <footer className="py-6 border-t border-slate-800/80 bg-slate-950/80 text-center text-xs text-slate-500 font-mono">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© 2026 ORCA Marine Intelligence System. All rights reserved.</p>
              <div className="flex items-center gap-4 text-slate-400">
                <span>Deterministic Decision Engine v1.0</span>
                <span>•</span>
                <span className="text-cyan-400">12 Collaborative AI Agents</span>
              </div>
            </div>
          </footer>
        </LocationLanguageProvider>
      </body>
    </html>
  );
}

