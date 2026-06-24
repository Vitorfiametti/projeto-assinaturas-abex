import React, { useState, useEffect } from 'react';
import { IPlan } from '@/lib/models/Plan';
import PlanCard from './PlanCard';
import PayButton from './PayButton';
import { useLanguage } from '@/context/LanguageContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: IPlan[];
  currentPlanId?: string;
  onPaymentSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plans,
  currentPlanId,
  onPaymentSuccess
}) => {

  const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(null);
      setBilling('monthly');
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Filter plans based on billing type
  const availablePlans = Array.isArray(plans)
    ? plans.filter(plan => {
        return billing === 'annual' ? plan.annualPrice : plan.monthlyPrice;
      })
    : [];

  const handlePlanSelect = (planId: string, selectedBilling: 'monthly' | 'annual') => {
    const plan = plans.find(p => p._id.toString() === planId);
    if (plan) {
      setSelectedPlan(plan);
      setBilling(selectedBilling);
      setError(null);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  };

  const handlePaymentStart = () => {
    setLoading(true);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, maxWidth: 900, width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Escolher Plano
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Selecione um plano para continuar</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{ padding: 8, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '50%', cursor: loading ? 'not-allowed' : 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Billing Toggle */}
        <div style={{ padding: 24, borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: billing === 'monthly' ? 'var(--text)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
              Mensal
            </span>
            <button
              onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
              disabled={loading}
              style={{
                position: 'relative', width: 56, height: 28,
                backgroundColor: billing === 'annual' ? 'var(--teal)' : 'var(--border)',
                borderRadius: 9999, cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none', outline: 'none', transition: 'background-color 0.3s ease'
              }}
            >
              <span style={{
                position: 'absolute',
                left: 3, top: 3,
                width: 22, height: 22,
                backgroundColor: 'white',
                borderRadius: '50%',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                transform: billing === 'annual' ? 'translateX(28px)' : 'translateX(0)',
                transition: 'transform 0.3s ease'
              }} />
            </button>
            <span style={{ fontSize: 16, fontWeight: 500, color: billing === 'annual' ? 'var(--text)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
              Anual
            </span>
            <div style={{ padding: '4px 12px', backgroundColor: '#00c9b1', borderRadius: 9999, color: '#ffffff', fontSize: 13, fontWeight: 600 }}>
              Economize 20%
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div style={{ padding: 24, overflowY: 'auto', maxHeight: '55vh', backgroundColor: '#1a1a1a' }}>
          {availablePlans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 8 }}>Nenhum plano disponível</h3>
              <p style={{ color: '#888', fontSize: 14 }}>
                Não há planos {billing === 'annual' ? 'anuais' : 'mensais'} disponíveis no momento.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 24,
              justifyContent: 'center',
            }}>
              {availablePlans.map((plan, index) => (
                <div key={plan._id.toString()} style={{ flex: '1 1 280px', maxWidth: 360 }}>
                  <PlanCard
                    plan={plan}
                    billing={billing}
                    onSelect={handlePlanSelect}
                    isPopular={index === 1}
                    loading={loading}
                    currentPlanId={currentPlanId}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid #e8192c', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <svg style={{ width: 20, height: 20, color: '#e8192c', marginTop: 2 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 500, color: '#e8192c' }}>Erro ao processar</h3>
                  <p style={{ fontSize: 13, color: '#e8192c', marginTop: 4 }}>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Plan Summary */}
        {selectedPlan && (
          <div style={{ borderTop: '1px solid var(--border)', padding: 24, backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontWeight: 600, color: 'var(--text)', fontSize: 16 }}>{selectedPlan.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Faturamento {billing === 'annual' ? 'anual' : 'mensal'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--teal)' }}>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(billing === 'annual' ? selectedPlan.annualPrice! : selectedPlan.monthlyPrice!)}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    /{billing === 'annual' ? 'ano' : 'mês'}
                  </p>
                </div>
                <PayButton
                  planId={selectedPlan._id.toString()}
                  billing={billing}
                  planName={selectedPlan.name}
                  price={billing === 'annual' ? selectedPlan.annualPrice! : selectedPlan.monthlyPrice!}
                  onPaymentStart={handlePaymentStart}
                  onPaymentSuccess={onPaymentSuccess}
                  onPaymentError={handlePaymentError}
                  disabled={loading}
                  className="min-w-[200px]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
