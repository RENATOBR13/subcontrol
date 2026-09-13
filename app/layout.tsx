import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Controle de Assinaturas',
  description: 'Sistema de gestão de assinaturas e clientes',
  openGraph: {
    title: 'Controle de Assinaturas',
    description: 'Sistema de gestão de assinaturas e clientes',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Controle de Assinaturas',
    description: 'Sistema de gestão de assinaturas e clientes',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased" suppressHydrationWarning>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
