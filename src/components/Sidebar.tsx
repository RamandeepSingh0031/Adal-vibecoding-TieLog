'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { signOut } from '@/lib/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearUserData } = useAppStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    clearUserData();
    router.push('/');
  };

  const navItems = [
    {
      label: 'Home',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Search',
      href: '/search',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-[#2D2D2D] border-r border-[#3E3E3E] transition-all duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className={`p-6 border-b border-[#3E3E3E] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
              <img src="/logo.jpg" alt="TieLog Logo" className="w-8 h-8 rounded-lg object-cover shadow-[0_4px_12px_rgba(20,184,166,0.3)] flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-xl font-semibold tracking-tight text-[#F4F4F5]">TieLog</span>
              )}
            </Link>
            {!isCollapsed && (
              <button
                onClick={onToggle}
                className="hidden lg:flex p-1.5 rounded-lg hover:bg-[#3E3E3E] text-[#71717A] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                    ? 'bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/20'
                    : 'text-[#A1A1AA] hover:bg-[#3E3E3E] hover:text-[#F4F4F5]'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Expand Button (If Collapsed) */}
          {isCollapsed && (
            <div className="p-4 flex justify-center border-t border-[#3E3E3E]">
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-[#3E3E3E] text-[#71717A] transition-colors"
                title="Expand Sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Upgrade Section - Only show for free users */}
          {(user?.plan === 'free' || !user?.plan) && (
            <div className="p-4 border-t border-[#3E3E3E]">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ plan: 'pro', userId: user?.id }),
                    });
                    const { url, error } = await res.json();
                    if (url) {
                      window.location.href = url;
                    } else {
                      alert(error || 'Checkout failed');
                    }
                  } catch (err) {
                    console.error('Checkout failed:', err);
                    alert('Something went wrong. Please try again.');
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-[#0A0A0F] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(20,184,166,0.15)] ${isCollapsed ? 'justify-center p-3' : ''
                  }`}
              >
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                  </svg>
                </div>
                {!isCollapsed && <span>Upgrade to Pro</span>}
              </button>
            </div>
          )}

          {/* Show current plan for paid users */}
          {user?.plan && user.plan !== 'free' && (
            <div className="p-4 border-t border-[#3E3E3E]">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium ${isCollapsed ? 'justify-center p-3' : ''}`}>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                  </svg>
                </div>
                {!isCollapsed && <span>{user.plan === 'lifetime' ? 'Lifetime' : 'Pro'} Member</span>}
              </div>
            </div>
          )}

          {/* Profile Section */}
          <div className="p-4 border-t border-[#3E3E3E]">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-expanded={showProfileMenu}
                aria-label="Open profile menu"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#3E3E3E] transition-colors ${isCollapsed ? 'justify-center' : ''
                  }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#2A2A35] flex items-center justify-center text-[#A1A1AA] flex-shrink-0">
                  {user?.full_name ? (
                    <span className="text-sm font-medium">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                {!isCollapsed && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-[#F4F4F5] truncate">
                        {user?.full_name || user?.email || 'Profile'}
                      </p>
                      <p className="text-xs text-[#71717A] truncate">
                        {user?.email || ''}
                      </p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-[#71717A] transition-transform ${showProfileMenu ? 'rotate-180' : ''
                        }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className={`absolute bottom-full mb-2 bg-[#2D2D2D] border border-[#3E3E3E] rounded-xl overflow-hidden shadow-lg ${isCollapsed ? 'left-14 w-48' : 'left-0 right-0'
                  }`}>
                  <Link
                    href="/settings"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onClose();
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[#A1A1AA] hover:bg-[#3E3E3E] hover:text-[#F4F4F5] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#F472B6] hover:bg-[#F472B6]/10 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {isSigningOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
