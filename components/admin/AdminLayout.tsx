'use client';

import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  userEmail: string;
}

export default function AdminLayout({ children, userEmail }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-navy-950">
      <AdminSidebar userEmail={userEmail} />

      {/* Main Content */}
      <div className="lg:pl-64 pb-16">
        {/* Mobile header spacer */}
        <div className="lg:hidden h-16" />

        {/* Page Content */}
        <main className="min-h-screen">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 lg:left-64 border-t border-navy-800 bg-navy-950 z-40">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-navy-500">
            <p>© 2025 Vuelatour. Todos los derechos reservados.</p>
            <a
              href="/es"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-navy-300 transition-colors"
            >
              Ver sitio público →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
