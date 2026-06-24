// src/components/NavBar.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Menu, X, User, Settings, LogOut, Crown,
  Home, FileText, Shield, ChevronDown, Globe,
  DollarSign, CalendarDays, Sun, Moon,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab?: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggle } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const isActiveTab = (tabName: string, path?: string) => {
    if (activeTab) return activeTab === tabName;
    if (path) return router.pathname === path || router.pathname.startsWith(path + '/');
    return false;
  };

  const getLinkClasses = (tabName: string, path?: string) => {
    const active = isActiveTab(tabName, path);
    const base = 'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200';
    if (active) return `${base} font-semibold`;
    return `${base} hover:opacity-70`;
  };

  const getLinkStyle = (tabName: string, path?: string) => {
    const active = isActiveTab(tabName, path);
    return { color: active ? 'var(--teal)' : 'var(--text)' };
  };

  const getMobileLinkClasses = (tabName: string, path?: string) => {
    const active = isActiveTab(tabName, path);
    const base = 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors';
    if (active) return `${base} font-semibold`;
    return `${base}`;
  };

  const getMobileLinkStyle = (tabName: string, path?: string) => {
    const active = isActiveTab(tabName, path);
    return { color: active ? 'var(--teal)' : 'var(--text-muted)', backgroundColor: active ? 'var(--teal-subtle)' : 'transparent' };
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setIsOpen(false);
    router.push('/auth/signin').finally(() => setTimeout(() => setIsLoginLoading(false), 500));
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
      setIsProfileOpen(false);
      setIsLangOpen(false);
    };
    if (isOpen || isProfileOpen || isLangOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, isProfileOpen, isLangOpen]);

  useEffect(() => {
    if (status === 'authenticated' || status === 'unauthenticated') setIsLoginLoading(false);
  }, [status]);

  const handleSignOut = () => signOut({ callbackUrl: '/' });

  const UserAvatar = ({ size = 'w-8 h-8' }: { size?: string }) => {
    const userImage = session?.user?.image;
    if (userImage) {
      return (
        <div className={`${size} rounded-full overflow-hidden`} style={{ border: '2px solid var(--border)' }}>
          <img src={userImage} alt={session?.user?.name || 'Perfil'} className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div className={`${size} rounded-full flex items-center justify-center`}
        style={{ backgroundColor: 'var(--accent-subtle)', border: '2px solid var(--border)' }}>
        <User className="w-4 h-4" style={{ color: 'var(--accent)' }} />
      </div>
    );
  };

  const LanguageSelector = ({ isMobile = false }: { isMobile?: boolean }) => {
    const flag = language === 'pt' ? '🇧🇷' : language === 'en' ? '🇺🇸' : '🇪🇸';
    const label = language === 'pt' ? 'PT' : language === 'en' ? 'EN' : 'ES';

    if (isMobile) {
      return (
        <div className="px-2 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-2" style={{ color: 'var(--text-muted)' }}>
            Idioma
          </p>
          {(['pt', 'en', 'es'] as const).map(lang => (
            <button key={lang}
              onClick={() => { setLanguage(lang); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1"
              style={{ color: language === lang ? 'var(--teal)' : 'var(--text-muted)', backgroundColor: language === lang ? 'var(--teal-subtle)' : 'transparent' }}>
              {lang === 'pt' ? '🇧🇷 Português' : lang === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setIsLangOpen(!isLangOpen); }}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--text)' }}>
          <Globe className="w-4 h-4" />
          <span className="hidden xl:block">{flag} {label}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        {isLangOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-xl border py-1 animate-fadeIn"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)' }}>
            {(['pt', 'en', 'es'] as const).map(lang => (
              <button key={lang}
                onClick={() => { setLanguage(lang); setIsLangOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:opacity-70"
                style={{ color: language === lang ? 'var(--teal)' : 'var(--text-muted)', fontWeight: language === lang ? 600 : 400 }}>
                {lang === 'pt' ? '🇧🇷 Português' : lang === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}
        style={{
          backgroundColor: 'var(--nav-bg)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <Crown className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <span className="font-black text-xl italic" style={{ color: 'var(--accent)' }}>
                Abex Clubs!
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              <Link href="/" className={getLinkClasses('home', '/')} style={getLinkStyle('home', '/')}>
                <Home className="w-4 h-4" />
                {t('navbar.home')}
              </Link>

              {status === 'authenticated' && (
                <>
                  {session.user?.role === 'admin' && (
                    <>
                      <Link href="/admin/dashboard" className={getLinkClasses('admin-dashboard', '/admin/dashboard')} style={getLinkStyle('admin-dashboard', '/admin/dashboard')}>
                        <Shield className="w-4 h-4" />
                        {t('navbar.dashboard')}
                      </Link>
                      <Link href="/admin/payments" className={getLinkClasses('admin-payments', '/admin/payments')} style={getLinkStyle('admin-payments', '/admin/payments')}>
                        <DollarSign className="w-4 h-4" />
                        Pagamentos
                      </Link>
                      <Link href="/admin/plans" className={getLinkClasses('admin-plans', '/admin/plans')} style={getLinkStyle('admin-plans', '/admin/plans')}>
                        <Settings className="w-4 h-4" />
                        {t('navbar.plans')}
                      </Link>
                      <Link href="/admin/content" className={getLinkClasses('admin-content', '/admin/content')} style={getLinkStyle('admin-content', '/admin/content')}>
                        <FileText className="w-4 h-4" />
                        {t('navbar.content')}
                      </Link>
                      <Link href="/admin/events" className={getLinkClasses('admin-events', '/admin/events')} style={getLinkStyle('admin-events', '/admin/events')}>
                        <CalendarDays className="w-4 h-4" />
                        {t('navbar.events')}
                      </Link>
                    </>
                  )}
                  <Link href="/member/plans" className={getLinkClasses('member-plans', '/member/plans')} style={getLinkStyle('member-plans', '/member/plans')}>
                    <Crown className="w-4 h-4" />
                    {t('navbar.plans')}
                  </Link>
                  <Link href="/member/content" className={getLinkClasses('member-content', '/member/content')} style={getLinkStyle('member-content', '/member/content')}>
                    <FileText className="w-4 h-4" />
                    {t('navbar.content')}
                  </Link>
                  <Link href="/member/events" className={getLinkClasses('events', '/member/events')} style={getLinkStyle('events', '/member/events')}>
                    <CalendarDays className="w-4 h-4" />
                    {t('navbar.events')}
                  </Link>
                </>
              )}
            </div>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-2">
              <LanguageSelector />

              {/* Theme Toggle */}
              <button onClick={toggle}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
                title={isDark ? 'Modo claro' : 'Modo escuro'}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {status === 'authenticated' ? (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
                    style={{ border: '1px solid var(--border)' }}>
                    <UserAvatar />
                    <span className="hidden xl:block max-w-28 truncate" style={{ color: 'var(--text)' }}>
                      {session.user?.name?.split(' ')[0] || session.user?.email}
                    </span>
                    <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border py-1 animate-fadeIn"
                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)' }}>
                      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-3">
                          <UserAvatar size="w-9 h-9" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                              {session.user?.name || 'Usuário'}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                        {session.user?.role === 'admin' && (
                          <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                            Admin
                          </span>
                        )}
                      </div>
                      <Link href="/member/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-opacity hover:opacity-70"
                        style={{ color: 'var(--text-muted)' }}>
                        <Settings className="w-4 h-4" />
                        {t('navbar.settings')}
                      </Link>
                      <button onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-opacity hover:opacity-70">
                        <LogOut className="w-4 h-4" />
                        {t('navbar.signOut')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={handleLoginClick} disabled={isLoginLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-70"
                  style={{ backgroundColor: 'var(--accent)' }}>
                  {isLoginLoading
                    ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Entrando...</>
                    : t('navbar.signIn')}
                </button>
              )}
            </div>

            {/* Mobile buttons */}
            <div className="lg:hidden flex items-center gap-2">
              <button onClick={toggle} className="p-2 rounded-full" style={{ color: 'var(--text-muted)' }}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="p-2 rounded-full" style={{ color: 'var(--text)' }}>
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 overflow-y-auto pt-16"
          style={{ backgroundColor: 'var(--bg)' }}>
          <div className="px-4 py-4 space-y-1">
            <Link href="/" className={getMobileLinkClasses('home', '/')} style={getMobileLinkStyle('home', '/')} onClick={() => setIsOpen(false)}>
              <Home className="w-5 h-5" /> {t('navbar.home')}
            </Link>

            {status === 'authenticated' && (
              <>
                {session.user?.role === 'admin' && (
                  <>
                    <Link href="/admin/dashboard" className={getMobileLinkClasses('admin-dashboard', '/admin/dashboard')} style={getMobileLinkStyle('admin-dashboard', '/admin/dashboard')} onClick={() => setIsOpen(false)}>
                      <Shield className="w-5 h-5" /> {t('navbar.dashboard')}
                    </Link>
                    <Link href="/admin/payments" className={getMobileLinkClasses('admin-payments', '/admin/payments')} style={getMobileLinkStyle('admin-payments', '/admin/payments')} onClick={() => setIsOpen(false)}>
                      <DollarSign className="w-5 h-5" /> Pagamentos
                    </Link>
                    <Link href="/admin/plans" className={getMobileLinkClasses('admin-plans', '/admin/plans')} style={getMobileLinkStyle('admin-plans', '/admin/plans')} onClick={() => setIsOpen(false)}>
                      <Settings className="w-5 h-5" /> {t('navbar.plans')}
                    </Link>
                    <Link href="/admin/content" className={getMobileLinkClasses('admin-content', '/admin/content')} style={getMobileLinkStyle('admin-content', '/admin/content')} onClick={() => setIsOpen(false)}>
                      <FileText className="w-5 h-5" /> {t('navbar.content')}
                    </Link>
                    <Link href="/admin/events" className={getMobileLinkClasses('admin-events', '/admin/events')} style={getMobileLinkStyle('admin-events', '/admin/events')} onClick={() => setIsOpen(false)}>
                      <CalendarDays className="w-5 h-5" /> {t('navbar.events')}
                    </Link>
                  </>
                )}
                <Link href="/member/plans" className={getMobileLinkClasses('member-plans', '/member/plans')} style={getMobileLinkStyle('member-plans', '/member/plans')} onClick={() => setIsOpen(false)}>
                  <Crown className="w-5 h-5" /> {t('navbar.plans')}
                </Link>
                <Link href="/member/content" className={getMobileLinkClasses('member-content', '/member/content')} style={getMobileLinkStyle('member-content', '/member/content')} onClick={() => setIsOpen(false)}>
                  <FileText className="w-5 h-5" /> {t('navbar.content')}
                </Link>
                <Link href="/member/events" className={getMobileLinkClasses('events', '/member/events')} style={getMobileLinkStyle('events', '/member/events')} onClick={() => setIsOpen(false)}>
                  <CalendarDays className="w-5 h-5" /> {t('navbar.events')}
                </Link>
              </>
            )}

            <div className="pt-3 border-t mt-3" style={{ borderColor: 'var(--border)' }}>
              <LanguageSelector isMobile />
            </div>

            {status === 'authenticated' ? (
              <div className="pt-3 border-t mt-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-2"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <UserAvatar size="w-10 h-10" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                      {session.user?.name || 'Usuário'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setIsOpen(false); handleSignOut(); }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-500 text-sm font-medium transition-opacity hover:opacity-70">
                  <LogOut className="w-5 h-5" /> {t('navbar.signOut')}
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t mt-3" style={{ borderColor: 'var(--border)' }}>
                <button onClick={handleLoginClick} disabled={isLoginLoading}
                  className="w-full py-3 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent)' }}>
                  {isLoginLoading ? 'Entrando...' : t('navbar.signIn')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
