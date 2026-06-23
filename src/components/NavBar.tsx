// src/components/Navbar.tsx
// VERSÃO FINAL - COM LINK DE PAGAMENTOS

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  Home,
  FileText,
  Shield,
  ChevronDown,
  Globe,
  DollarSign, // ✨ NOVO ÍCONE
  CalendarDays
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  activeTab?: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

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
    const base = "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105";
    const active = isActiveTab(tabName, path);

    if (active) {
      return `${base} bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-purple-300 border border-purple-500/50 shadow-lg shadow-purple-500/20`;
    }
    return `${base} ${scrolled 
      ? 'text-slate-300 hover:text-purple-400 hover:bg-purple-900/20' 
      : 'text-slate-300 hover:text-white hover:bg-white/10'}`;
  };

  const getMobileLinkClasses = (tabName: string, path?: string) => {
    const base = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200";
    const active = isActiveTab(tabName, path);
    if (active) {
      return `${base} bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-purple-300 border border-purple-500/50`;
    }
    return `${base} ${scrolled 
      ? 'text-slate-300 hover:bg-purple-900/20' 
      : 'text-slate-300 hover:bg-white/10'}`;
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setIsOpen(false);
    router.push('/auth/signin').finally(() => {
      setTimeout(() => setIsLoginLoading(false), 500);
    });
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
    if (status === 'authenticated' || status === 'unauthenticated') {
      setIsLoginLoading(false);
    }
  }, [status]);

  const handleSignOut = () => signOut({ callbackUrl: '/' });

  const UserAvatar = ({ size = 'w-8 h-8', showBorder = true }) => {
    const userImage = session?.user?.image;
    if (userImage) {
      return (
        <div className={`${size} relative ${showBorder ? 'ring-2 ring-purple-500/30' : ''} rounded-full overflow-hidden`}>
          <img 
            src={userImage} 
            alt={session?.user?.name || 'Perfil'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      );
    }
    return (
      <div className={`${size} bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center ${showBorder ? 'ring-2 ring-purple-500/30' : ''}`}>
        <User className="w-4 h-4 text-white" />
      </div>
    );
  };

  const LoginButton = ({ isMobile = false }) => {
    const base = isMobile
      ? "block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:from-purple-700 hover:to-blue-700"
      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg";

    return (
      <button
        onClick={handleLoginClick}
        disabled={isLoginLoading}
        className={`${base} ${isLoginLoading ? 'opacity-80 cursor-not-allowed' : ''} flex items-center justify-center gap-2`}
      >
        {isLoginLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('loading')}
          </>
        ) : (
          t('navbar.signIn')
        )}
      </button>
    );
  };

  const LanguageSelector = ({ isMobile = false }) => {
    const getLanguageLabel = () => {
      switch (language) {
        case 'pt': return '🇧🇷 PT';
        case 'en': return '🇺🇸 EN';
        case 'es': return '🇪🇸 ES';
        default: return '🌍';
      }
    };

    if (isMobile) {
      return (
        <div className="px-4 py-2">
          <p className="text-slate-400 text-xs uppercase font-semibold mb-2">
            {t('language.select') || 'Idioma'}
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => {
                setLanguage('pt');
                setIsOpen(false);
              }} 
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                language === 'pt' 
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50' 
                  : 'text-slate-300 hover:bg-purple-900/20'
              }`}
            >
              🇧🇷 {t('language.portuguese')}
            </button>
            <button 
              onClick={() => {
                setLanguage('en');
                setIsOpen(false);
              }} 
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                language === 'en' 
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50' 
                  : 'text-slate-300 hover:bg-purple-900/20'
              }`}
            >
              🇺🇸 {t('language.english')}
            </button>
            <button 
              onClick={() => {
                setLanguage('es');
                setIsOpen(false);
              }} 
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                language === 'es' 
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50' 
                  : 'text-slate-300 hover:bg-purple-900/20'
              }`}
            >
              🇪🇸 {t('language.spanish')}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLangOpen(!isLangOpen);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
            scrolled 
              ? 'text-slate-300 hover:bg-purple-900/20' 
              : 'text-white hover:bg-white/10'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span className="hidden xl:block">{getLanguageLabel()}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isLangOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <button 
              onClick={() => {
                setLanguage('pt');
                setIsLangOpen(false);
              }} 
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-purple-900/20 transition-colors duration-200 ${
                language === 'pt' ? 'text-purple-400 bg-purple-900/10' : 'text-slate-300'
              }`}
            >
               {t('language.portuguese')}
            </button>
            <button 
              onClick={() => {
                setLanguage('en');
                setIsLangOpen(false);
              }} 
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-purple-900/20 transition-colors duration-200 ${
                language === 'en' ? 'text-purple-400 bg-purple-900/10' : 'text-slate-300'
              }`}
            >
               {t('language.english')}
            </button>
            <button 
              onClick={() => {
                setLanguage('es');
                setIsLangOpen(false);
              }} 
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-purple-900/20 transition-colors duration-200 ${
                language === 'es' ? 'text-purple-400 bg-purple-900/10' : 'text-slate-300'
              }`}
            >
               {t('language.spanish')}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <nav 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-purple-900/30' 
            : 'bg-gradient-to-r from-slate-800 via-slate-900 to-gray-900 shadow-xl'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            
            <Link 
              href="/" 
              className={`text-2xl lg:text-3xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                scrolled 
                  ? 'bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent' 
                  : 'text-white'
              }`}
            >
              <Crown className="w-6 h-6 lg:w-8 lg:h-8" />
              Abex Clubs
            </Link>

            {/* Navegação desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link href="/" className={getLinkClasses('home', '/')}>
                <Home className="w-4 h-4" />
                {t('navbar.home')}
              </Link>

              {status === 'authenticated' && (
                <>
                  {session.user?.role === 'admin' && (
                    <div className="flex items-center space-x-4">
                      <Link href="/admin/dashboard" className={getLinkClasses('admin-dashboard', '/admin/dashboard')}>
                        <Shield className="w-4 h-4" />
                        {t('navbar.dashboard')}
                      </Link>
                      
                      {/* ✨ NOVO LINK - Pagamentos */}
                      <Link href="/admin/payments" className={getLinkClasses('admin-payments', '/admin/payments')}>
                        <DollarSign className="w-4 h-4" />
                        Pagamentos
                      </Link>
                      
                      <Link href="/admin/plans" className={getLinkClasses('admin-plans', '/admin/plans')}>
                        <Settings className="w-4 h-4" />
                        {t('navbar.plans')}
                      </Link>
                      <Link href="/admin/content" className={getLinkClasses('admin-content', '/admin/content')}>
                        <FileText className="w-4 h-4" />
                        {t('navbar.content')}
                      </Link>
                    </div>
                  )}

                  <Link href="/member/plans" className={getLinkClasses('member-plans', '/member/plans')}>
                    <Crown className="w-4 h-4" />
                    {t('navbar.plans')}
                  </Link>

                  <Link href="/member/content" className={getLinkClasses('member-content', '/member/content')}>
                    <FileText className="w-4 h-4" />
                    {t('navbar.content')}
                  </Link>

                  <Link href="/member/events" className={getLinkClasses('events', '/member/events')}>
                    <CalendarDays className="w-4 h-4" />
                    {t('navbar.events')}
                  </Link>
                </>
              )}

              <LanguageSelector />

              {status === 'authenticated' ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileOpen(!isProfileOpen);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                      scrolled 
                        ? 'text-slate-300 hover:bg-purple-900/20' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <UserAvatar />
                    <span className="hidden xl:block max-w-24 truncate">
                      {session.user?.name || session.user?.email}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                          <UserAvatar size="w-10 h-10" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {session.user?.name || t('user')}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                        {session.user?.role === 'admin' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {t('navbar.admin')}
                          </span>
                        )}
                      </div>
                      <Link
                          href="/member/settings"
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors duration-200"
                        >
                        <Settings className="w-4 h-4" />
                        {t('navbar.settings')}
                      </Link>
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('navbar.signOut')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <LoginButton />
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-200 ${
                scrolled 
                  ? 'text-slate-300 hover:bg-purple-900/20' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* 📱 Menu Mobile */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-md">
          <div className="h-full overflow-y-auto pt-20 pb-6 px-4">
            <div className="space-y-2">
              <Link 
                href="/" 
                className={getMobileLinkClasses('home', '/')}
                onClick={() => setIsOpen(false)}
              >
                <Home className="w-5 h-5" />
                {t('navbar.home')}
              </Link>

              {status === 'authenticated' && (
                <>
                  {session.user?.role === 'admin' && (
                    <>
                      <Link 
                        href="/admin/dashboard" 
                        className={getMobileLinkClasses('admin-dashboard', '/admin/dashboard')}
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield className="w-5 h-5" />
                        {t('navbar.dashboard')}
                      </Link>
                      
                      {/* ✨ NOVO LINK MOBILE - Pagamentos */}
                      <Link 
                        href="/admin/payments" 
                        className={getMobileLinkClasses('admin-payments', '/admin/payments')}
                        onClick={() => setIsOpen(false)}
                      >
                        <DollarSign className="w-5 h-5" />
                        Pagamentos
                      </Link>
                      
                      <Link 
                        href="/admin/plans" 
                        className={getMobileLinkClasses('admin-plans', '/admin/plans')}
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="w-5 h-5" />
                        {t('navbar.plans')}
                      </Link>
                      <Link 
                        href="/admin/content" 
                        className={getMobileLinkClasses('admin-content', '/admin/content')}
                        onClick={() => setIsOpen(false)}
                      >
                        <FileText className="w-5 h-5" />
                        {t('navbar.content')}
                      </Link>
                    </>
                  )}

                  <Link 
                    href="/member/plans" 
                    className={getMobileLinkClasses('member-plans', '/member/plans')}
                    onClick={() => setIsOpen(false)}
                  >
                    <Crown className="w-5 h-5" />
                    {t('navbar.plans')}
                  </Link>

                  <Link 
                    href="/member/content" 
                    className={getMobileLinkClasses('member-content', '/member/content')}
                    onClick={() => setIsOpen(false)}
                  >
                    <FileText className="w-5 h-5" />
                    {t('navbar.content')}
                  </Link>

                  <Link
                    href="/member/events"
                    className={getMobileLinkClasses('events', '/member/events')}
                    onClick={() => setIsOpen(false)}
                  >
                    <CalendarDays className="w-5 h-5" />
                    {t('navbar.events')}
                  </Link>
                </>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <LanguageSelector isMobile />
            </div>

            {status === 'authenticated' ? (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg mb-4">
                  <UserAvatar size="w-12 h-12" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {session.user?.name || t('user')}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                {session.user?.role === 'admin' && (
                  <div className="px-4 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {t('navbar.admin')}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  {t('navbar.signOut')}
                </button>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <LoginButton isMobile />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;