'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Transactions', href: '/expenses', icon: '💳' },
  { name: 'History', href: '/history', icon: '🕒' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide navigation on login/register pages
  const hideNavRoutes = ['/', '/login', '/register'];
  if (hideNavRoutes.includes(pathname || '')) {
    return null;
  }

  if (status === 'loading' || !session) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-[#0a0a0a] border-b border-[#0a6b7a]/20 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo - Much Bigger */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="relative w-14 h-14 md:w-16 md:h-16">
                <Image
                  src="/images/etlogo.png"
                  alt="Walleto"
                  width={64}
                  height={64}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-2xl md:text-3xl font-bold">
                <span className="text-[#0a6b7a]">Wall</span>
                <span className="text-[#00d4ff]">eto</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#00d4ff]/10 text-[#00d4ff]'
                        : 'text-gray-400 hover:text-white hover:bg-[#141414]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-sm text-gray-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-[#141414]"
              >
                🚪 Logout
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] font-semibold text-sm">
                  {session.user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm text-gray-300 hidden lg:block">
                  {session.user?.name || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#0a6b7a]/20 z-50">
        <div className="flex justify-around items-center h-16">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 transition-all ${
                  isActive
                    ? 'text-[#00d4ff]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#00d4ff]' : 'text-gray-500'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom padding for mobile to account for nav bar */}
      <div className="md:hidden h-16" />
    </>
  );
}