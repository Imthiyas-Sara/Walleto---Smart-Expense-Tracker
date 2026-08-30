'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  
  // Hide footer on login and register pages
  const hideFooterRoutes = ['/', '/login', '/register'];
  if (hideFooterRoutes.includes(pathname || '')) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#0a6b7a]/20 py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>
              © {currentYear} <span className="text-[#00d4ff] font-medium">Walleto</span>
            </span>
            <span className="text-gray-700">|</span>
            <span className="text-gray-600">v1.0.0</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hover:text-[#00d4ff] transition-colors">
              Dashboard
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/expenses" className="hover:text-[#00d4ff] transition-colors">
              Transactions
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/history" className="hover:text-[#00d4ff] transition-colors">
              History
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/settings" className="hover:text-[#00d4ff] transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}