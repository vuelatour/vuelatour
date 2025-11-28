import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Admin - Vuelatour',
  description: 'Panel de administración de Vuelatour',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
            classNames: {
              toast: 'group',
              actionButton: '!bg-red-500 !text-white !font-medium hover:!bg-red-600',
              cancelButton: '!bg-slate-600 !text-white !font-medium hover:!bg-slate-500',
              description: '!text-slate-400',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
