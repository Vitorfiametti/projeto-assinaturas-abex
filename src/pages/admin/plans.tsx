// src/pages/admin/plans.tsx
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import Layout from '@/components/Layout';
import { Crown, Edit, Trash2, Plus, DollarSign, Users, X, Check } from 'lucide-react';
import { useState } from 'react';
import { connectMongoose } from '@/lib/mongodb';
import Plan from '@/lib/models/Plan';

interface PlanType {
  _id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  isActive: boolean;
  trialDays: number;
}

interface AdminPlansPageProps {
  plans: PlanType[];
}

export default function AdminPlansPage({ plans = [] }: AdminPlansPageProps) {
  const [plansList, setPlansList] = useState<PlanType[]>(plans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthlyPrice: '',
    annualPrice: '',
    trialDays: '0',
    isActive: true,
  });

  const [features, setFeatures] = useState<string[]>(['']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      monthlyPrice: '',
      annualPrice: '',
      trialDays: '0',
      isActive: true,
    });
    setFeatures(['']);
    setError('');
    setSuccess('');
    setIsEditMode(false);
    setEditingPlanId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: PlanType) => {
    setFormData({
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice.toString(),
      annualPrice: plan.annualPrice.toString(),
      trialDays: plan.trialDays.toString(),
      isActive: plan.isActive,
    });
    setFeatures(plan.features.length > 0 ? plan.features : ['']);
    setIsEditMode(true);
    setEditingPlanId(plan._id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validações
      if (!formData.name || !formData.description) {
        setError('Nome e descrição são obrigatórios');
        setLoading(false);
        return;
      }

      const filteredFeatures = features.filter(f => f.trim() !== '');
      if (filteredFeatures.length === 0) {
        setError('Adicione pelo menos uma feature');
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        monthlyPrice: parseFloat(formData.monthlyPrice),
        annualPrice: parseFloat(formData.annualPrice),
        trialDays: parseInt(formData.trialDays),
        features: filteredFeatures,
        isActive: formData.isActive,
      };

      if (isEditMode && editingPlanId) {
        // Atualizar plano existente
        const response = await fetch('/api/admin/plans', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingPlanId,
            ...payload,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erro ao atualizar plano');
          setLoading(false);
          return;
        }

        setSuccess('Plano atualizado com sucesso!');

        // Atualizar lista de planos
        setPlansList(plansList.map(p => p._id === editingPlanId ? data.plan : p));
      } else {
        // Criar novo plano
        const response = await fetch('/api/admin/plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erro ao criar plano');
          setLoading(false);
          return;
        }

        setSuccess('Plano criado com sucesso!');

        // Adicionar à lista de planos
        setPlansList([...plansList, data.plan]);
      }

      // Fechar modal após sucesso
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Error saving plan:', error);
      setError('Erro ao salvar plano');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Tem certeza que deseja deletar este plano?')) return;

    try {
      const response = await fetch(`/api/admin/plans?id=${planId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('Erro ao deletar plano');
        return;
      }

      setPlansList(plansList.filter(p => p._id !== planId));
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Erro ao deletar plano');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 16px',
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <Layout activeTab="admin-plans">
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Gerenciar Planos
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>
                Crie e edite os planos de assinatura da plataforma
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Novo Plano
            </button>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Crown style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>Total de Planos</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>{plansList.length}</p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>Planos Ativos</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
                {plansList.filter(p => p.isActive).length}
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--teal)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>Assinantes</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>0</p>
            </div>
          </div>

          {/* Plans List / Empty State */}
          {plansList.length === 0 ? (
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
              <Crown style={{ width: '64px', height: '64px', color: 'var(--border)', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                Nenhum plano cadastrado
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                Comece criando seu primeiro plano de assinatura
              </p>
              <button
                onClick={handleOpenCreateModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <Plus style={{ width: '20px', height: '20px' }} />
                Criar Primeiro Plano
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {plansList.map((plan) => (
                <div
                  key={plan._id}
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', transition: 'all 0.3s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>{plan.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEditModal(plan)}
                        style={{ padding: '8px', color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                        title="Editar plano"
                      >
                        <Edit style={{ width: '16px', height: '16px' }} />
                      </button>
                      <button
                        onClick={() => handleDelete(plan._id)}
                        style={{ padding: '8px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                        title="Deletar plano"
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>{plan.description}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Mensal</span>
                      <span style={{ color: 'var(--text)', fontWeight: 700 }}>
                        R$ {plan.monthlyPrice?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Anual</span>
                      <span style={{ color: 'var(--text)', fontWeight: 700 }}>
                        R$ {plan.annualPrice?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>

                  <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>Features:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {(plan.features || []).slice(0, 3).map((feature, index) => (
                        <p key={index} style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                          • {feature}
                        </p>
                      ))}
                      {(plan.features || []).length > 3 && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                          +{plan.features.length - 3} mais
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: plan.isActive ? 'var(--teal-subtle)' : 'var(--accent-subtle)',
                        color: plan.isActive ? 'var(--teal)' : 'var(--accent)',
                      }}
                    >
                      {plan.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    {plan.trialDays > 0 && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {plan.trialDays} dias grátis
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criar/Editar Plano */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', maxWidth: '672px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
                {isEditMode ? 'Editar Plano' : 'Criar Novo Plano'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X style={{ width: '24px', height: '24px' }} />
              </button>
            </div>

            {error && (
              <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent)', borderRadius: '8px', color: 'var(--accent)' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'var(--teal-subtle)', border: '1px solid var(--teal)', borderRadius: '8px', color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check style={{ width: '20px', height: '20px' }} />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
                    Nome do Plano *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={inputStyle}
                    placeholder="Ex: Premium"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
                    Dias de Trial
                  </label>
                  <input
                    type="number"
                    value={formData.trialDays}
                    onChange={(e) => setFormData({...formData, trialDays: e.target.value})}
                    style={inputStyle}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
                  Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  rows={3}
                  placeholder="Descreva o plano..."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
                    Preço Mensal (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({...formData, monthlyPrice: e.target.value})}
                    style={inputStyle}
                    placeholder="29.00"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
                    Preço Anual (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.annualPrice}
                    onChange={(e) => setFormData({...formData, annualPrice: e.target.value})}
                    style={inputStyle}
                    placeholder="299.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
                  Features *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {features.map((feature, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="Ex: Acesso a todo conteúdo"
                      />
                      {features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          style={{ padding: '8px 12px', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                        >
                          <X style={{ width: '16px', height: '16px' }} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', textAlign: 'left', padding: 0 }}
                  >
                    + Adicionar Feature
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="isActive" style={{ fontSize: '14px', color: 'var(--text)' }}>
                  Plano ativo
                </label>
              </div>

              <div style={{ display: 'flex', gap: '16px', paddingTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    opacity: loading ? 0.5 : 1,
                  }}
                  disabled={loading}
                >
                  {loading ? (isEditMode ? 'Salvando...' : 'Criando...') : (isEditMode ? 'Salvar Alterações' : 'Criar Plano')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session) {
      return {
        redirect: {
          destination: '/auth/signin',
          permanent: false,
        },
      };
    }

    // @ts-ignore
    if (session.user?.role !== 'admin') {
      return {
        redirect: {
          destination: '/member/content',
          permanent: false,
        },
      };
    }

    await connectMongoose();

    const plansFromDb = await Plan.find({}).lean().exec();
    const serializedPlans = JSON.parse(JSON.stringify(plansFromDb));

    return {
      props: {
        plans: serializedPlans || [],
      },
    };
  } catch (error) {
    console.error('Error loading plans:', error);

    return {
      props: {
        plans: [],
      },
    };
  }
};
