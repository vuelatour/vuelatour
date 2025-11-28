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
      <div className="lg:pl-64">
        {/* Mobile header spacer */}
        <div className="lg:hidden h-16" />

        {/* Page Content */}
        <main className="min-h-screen flex flex-col">
          <div className="flex-1 p-6 lg:p-8">
            {children}
          </div>

          {/* Footer */}
          <footer className="border-t border-navy-800">
            <div className="px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-navy-500">
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
        </main>
      </div>
    </div>
  );
}
