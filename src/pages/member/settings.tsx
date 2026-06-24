// src/pages/member/settings.tsx
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { signOut } from 'next-auth/react';
import Layout from '@/components/Layout';
import { useState } from 'react';
import {
  User,
  Trash2,
  AlertTriangle,
  Shield,
  Mail,
  X,
  Check
} from 'lucide-react';
import { useRouter } from 'next/router';

interface SettingsPageProps {
  user: {
    name: string;
    email: string;
    image?: string;
    createdAt: string;
  };
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETAR') {
      setError('Digite "DELETAR" para confirmar');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao deletar conta');
      }

      // Deslogar e redirecionar
      await signOut({
        callbackUrl: '/?deleted=true',
        redirect: true
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      setError(error instanceof Error ? error.message : 'Erro ao deletar conta');
      setIsDeleting(false);
    }
  };

  return (
    <Layout activeTab="settings">
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg)',
          padding: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '56rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Header */}
          <div>
            <h1
              style={{
                fontSize: '1.875rem',
                fontWeight: 800,
                color: 'var(--text)',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
                margin: '0 0 0.5rem 0',
              }}
            >
              Configurações da Conta
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Gerencie suas informações e preferências
            </p>
          </div>

          {/* Perfil do Usuário */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '1.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 0 1rem 0',
              }}
            >
              <User style={{ width: '1.25rem', height: '1.25rem' }} />
              Informações da Conta
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    style={{
                      width: '4rem',
                      height: '4rem',
                      borderRadius: '50%',
                      border: '2px solid var(--border)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '4rem',
                      height: '4rem',
                      backgroundColor: 'var(--accent)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <User style={{ width: '2rem', height: '2rem', color: 'white' }} />
                  </div>
                )}
                <div>
                  <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1.125rem', margin: '0 0 0.25rem 0' }}>
                    {user.name}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                    {user.email}
                  </p>
                </div>
              </div>

              <div
                style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem', margin: '0 0 0.25rem 0' }}>
                    Nome
                  </p>
                  <p style={{ color: 'var(--text)', margin: 0 }}>{user.name}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem', margin: '0 0 0.25rem 0' }}>
                    Email
                  </p>
                  <p style={{ color: 'var(--text)', margin: 0 }}>{user.email}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem', margin: '0 0 0.25rem 0' }}>
                    Membro desde
                  </p>
                  <p style={{ color: 'var(--text)', margin: 0 }}>
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Zona de Perigo */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '2px solid var(--accent)',
              borderRadius: '16px',
              padding: '1.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--accent)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 0 1rem 0',
              }}
            >
              <AlertTriangle style={{ width: '1.25rem', height: '1.25rem' }} />
              Zona de Perigo
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h3 style={{ color: 'var(--text)', fontWeight: 600, marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>
                  Deletar Conta
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', margin: '0 0 1rem 0' }}>
                  Esta ação é <strong style={{ color: 'var(--accent)' }}>permanente e irreversível</strong>.{' '}
                  Todos os seus dados serão removidos permanentemente do sistema de acordo com a LGPD.
                </p>

                <div
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <h4
                    style={{
                      color: 'var(--text)',
                      fontWeight: 600,
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      margin: '0 0 0.75rem 0',
                    }}
                  >
                    <Shield style={{ width: '1rem', height: '1rem', color: 'var(--text-muted)' }} />
                    O que será deletado:
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      'Todas as suas informações pessoais',
                      'Histórico de assinaturas e pagamentos',
                      'Acesso a todo conteúdo exclusivo',
                      'Todos os dados associados à sua conta',
                    ].map((item, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text)' }}>
                        <Check style={{ width: '1rem', height: '1rem', color: 'var(--accent)', marginTop: '0.125rem', flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 style={{ width: '1rem', height: '1rem' }} />
                  Deletar Minha Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {isDeleteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '2px solid var(--accent)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '28rem',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: 'var(--accent-subtle)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertTriangle style={{ width: '1.5rem', height: '1.5rem', color: 'var(--accent)' }} />
                </div>
                <h3
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--text)',
                    margin: 0,
                  }}
                >
                  Confirmar Exclusão
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setConfirmText('');
                  setError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  padding: '0.25rem',
                }}
                disabled={isDeleting}
              >
                <X style={{ width: '1.5rem', height: '1.5rem' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  border: '1px solid var(--accent)',
                  borderRadius: '10px',
                  padding: '1rem',
                }}
              >
                <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>
                  ⚠️ Esta ação não pode ser desfeita!
                </p>
                <p style={{ color: 'var(--text)', fontSize: '0.875rem', margin: 0 }}>
                  Todos os seus dados serão <strong>permanentemente removidos</strong> do sistema
                  e você será deslogado automaticamente.
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Digite <span style={{ color: 'var(--accent)', fontWeight: 700 }}>DELETAR</span> para confirmar:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--text)',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Digite DELETAR"
                  disabled={isDeleting}
                  autoFocus
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--accent-subtle)',
                    border: '1px solid var(--accent)',
                    borderRadius: '10px',
                    color: 'var(--accent)',
                    fontSize: '0.875rem',
                  }}
                >
                  {error}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setConfirmText('');
                  setError('');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text)',
                  fontWeight: 700,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                }}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmText !== 'DELETAR'}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--accent)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: isDeleting || confirmText !== 'DELETAR' ? 'not-allowed' : 'pointer',
                  opacity: isDeleting || confirmText !== 'DELETAR' ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {isDeleting ? (
                  <>
                    <div
                      style={{
                        width: '1rem',
                        height: '1rem',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 style={{ width: '1rem', height: '1rem' }} />
                    Deletar Conta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || !session.user) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        name: session.user.name || 'Usuário',
        email: session.user.email || '',
        image: session.user.image || null,
        // @ts-ignore
        createdAt: session.user.createdAt || new Date().toISOString(),
      },
    },
  };
};
