// src/pages/auth/signin.tsx
import { getProviders, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import Layout from '@/components/Layout';
import Image from 'next/image';
import Link from 'next/link';
import withAuth from '@/components/withAuth';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Crown,
  Shield,
  Sparkles,
  Users,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react';

const google_logo: string = require('@/assets/image/google-logo.png');

interface SignInPageProps {
  providers: Awaited<ReturnType<typeof getProviders>>;
}

function SignIn({ providers }: SignInPageProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Crown className="w-5 h-5" />,
      title: t('signin.features.exclusive.title'),
      description: t('signin.features.exclusive.description')
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: t('signin.features.community.title'),
      description: t('signin.features.community.description')
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: t('signin.features.security.title'),
      description: t('signin.features.security.description')
    }
  ];

  return (
    <Layout>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          backgroundColor: 'var(--bg)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '72rem', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            {/* Left side - Branding & Features */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <h1
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      fontStyle: 'italic',
                      color: 'var(--accent)',
                      margin: 0,
                      lineHeight: 1.1,
                    }}
                  >
                    Abex Clubs!
                  </h1>
                </div>
                <p
                  style={{
                    fontSize: '1.125rem',
                    color: 'var(--text-muted)',
                    maxWidth: '32rem',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {t('signin.subtitle')}
                </p>
              </div>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {features.map((feature, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.5rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--accent-subtle)',
                        color: 'var(--accent)',
                        flexShrink: 0,
                      }}
                    >
                      {feature.icon}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontWeight: 700,
                          color: 'var(--text)',
                          marginBottom: '0.25rem',
                          margin: '0 0 0.25rem 0',
                        }}
                      >
                        {feature.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', marginRight: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: '2rem',
                        height: '2rem',
                        backgroundColor: 'var(--teal)',
                        borderRadius: '50%',
                        border: '2px solid var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: i === 1 ? 0 : '-0.5rem',
                      }}
                    >
                      <Star style={{ width: '0.75rem', height: '0.75rem', color: 'white', fill: 'white' }} />
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '0.875rem' }}>
                  {t('signin.stats')}
                </span>
              </div>
            </div>

            {/* Right side - Login Form */}
            <div>
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '2.5rem',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                }}
              >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.375rem 1rem',
                      backgroundColor: 'var(--accent-subtle)',
                      borderRadius: '999px',
                      color: 'var(--accent)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                    }}
                  >
                    <Sparkles style={{ width: '1rem', height: '1rem' }} />
                    {t('signin.badge')}
                  </div>
                  <h2
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      color: 'var(--text)',
                      textTransform: 'uppercase',
                      marginBottom: '0.75rem',
                      margin: '0 0 0.75rem 0',
                    }}
                  >
                    {t('signin.title')}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                    {t('signin.description')}
                  </p>
                </div>

                {/* Google Sign In Button — sempre visível */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-card)',
                      border: '2px solid var(--border)',
                      borderRadius: '12px',
                      padding: '1rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      color: 'var(--text)',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                    onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                  >
                    {isLoading ? (
                      <div
                        style={{
                          width: '1.5rem',
                          height: '1.5rem',
                          border: '2px solid var(--border)',
                          borderTopColor: 'var(--accent)',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                    ) : (
                      <Image
                        src={google_logo}
                        alt="Google Logo"
                        width={24}
                        height={24}
                        style={{ width: '1.5rem', height: '1.5rem' }}
                      />
                    )}
                    <span>
                      {isLoading
                        ? t('signin.signing')
                        : t('signin.googleButton')
                      }
                    </span>
                    {!isLoading && (
                      <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
                    )}
                  </button>

                  {/* Benefits */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      t('signin.benefits.secure'),
                      t('signin.benefits.instant'),
                      t('signin.benefits.sync'),
                    ].map((benefit, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          color: 'var(--text)',
                          fontSize: '0.875rem',
                        }}
                      >
                        <CheckCircle
                          style={{ width: '1rem', height: '1rem', color: 'var(--teal)', flexShrink: 0 }}
                        />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    margin: '2rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: 1, borderTop: '1px solid var(--border)' }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                    {t('signin.secureLabel')}
                  </span>
                  <div style={{ flex: 1, borderTop: '1px solid var(--border)' }} />
                </div>

                {/* Security note */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                    {t('signin.terms')}{' '}
                    <Link
                      href="/terms"
                      style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                    >
                      {t('signin.termsLink')}
                    </Link>{' '}
                    {t('signin.and')}{' '}
                    <Link
                      href="/privacy"
                      style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                    >
                      {t('signin.privacyLink')}
                    </Link>
                  </p>
                </div>
              </div>

              {/* Additional CTA */}
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                  {t('signin.newUser')}{' '}
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    {t('signin.autoCreate')}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const providers = await getProviders();
  return {
    props: {
      providers,
    },
  };
}

export default withAuth(SignIn, { redirectIfAuthenticated: true });
