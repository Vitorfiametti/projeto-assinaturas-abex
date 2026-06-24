// src/components/Layout.tsx
import React from 'react';
import Navbar from './NavBar';
import { useLanguage } from '../context/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <Navbar activeTab={activeTab} />

      <main className="flex-grow animate-fadeIn">
        {children}
      </main>

      <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--accent)' }}>Abex Clubs</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {t('footer.description')}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                {t('footer.quickLinks')}
              </h4>
              <div className="space-y-2 text-sm">
                {[
                  { href: '/about', label: t('footer.aboutUs') },
                  { href: '/contact', label: t('footer.contact') },
                  { href: '/support', label: t('footer.support') },
                ].map(link => (
                  <a key={link.href} href={link.href}
                    className="block transition-colors hover:underline"
                    style={{ color: 'var(--text-muted)' }}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                {t('footer.contactSection')}
              </h4>
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <p>{t('footer.email')}</p>
                <p>{t('footer.phone')}</p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4"
            style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              &copy; {new Date().getFullYear()} Abex Clubs. {t('footer.copyright').replace('© 2025 ', '').replace('Abex Clubs ', '')}
            </p>
            <div className="flex gap-6 text-xs">
              <a href="/privacy" className="hover:underline transition-colors" style={{ color: 'var(--text-muted)' }}>
                {t('footer.privacyPolicy')}
              </a>
              <a href="/terms" className="hover:underline transition-colors" style={{ color: 'var(--text-muted)' }}>
                {t('footer.termsOfService')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
