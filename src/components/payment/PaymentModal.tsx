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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/50">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Escolher Plano</h2>
            <p className="text-slate-400 mt-1">Selecione um plano para continuar</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Billing Toggle */}
        <div className="p-6 border-b border-slate-700/50 bg-slate-900/30">
          <div className="flex items-center justify-center gap-4">
            <span className={`text-lg font-medium transition-colors ${billing === 'monthly' ? 'text-white' : 'text-slate-500'}`}>
              Mensal
            </span>
            <button
              onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
              disabled={loading}
              className="relative w-16 h-8 bg-slate-700 rounded-full border border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <span className={`absolute left-1 top-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg transform transition-transform duration-300 ${
                billing === 'annual' ? 'translate-x-8' : ''
              }`}></span>
            </button>
            <span className={`text-lg font-medium transition-colors ${billing === 'annual' ? 'text-white' : 'text-slate-500'}`}>
              Anual
            </span>
            <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white text-sm font-medium">
              Economize 20%
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {availablePlans.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum plano disponível</h3>
              <p className="text-slate-400">
                Não há planos {billing === 'annual' ? 'anuais' : 'mensais'} disponíveis no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePlans.map((plan, index) => (
                <PlanCard
                  key={plan._id.toString()}
                  plan={plan}
                  billing={billing}
                  onSelect={handlePlanSelect}
                  isPopular={index === 1}
                  loading={loading}
                  currentPlanId={currentPlanId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-400">Erro ao processar</h3>
                  <p className="text-sm text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Plan Summary */}
        {selectedPlan && (
          <div className="border-t border-slate-700/50 p-6 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-lg">{selectedPlan.name}</h3>
                <p className="text-sm text-slate-400">
                Faturamento {billing === 'annual' ? 'anual' : 'mensal'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(billing === 'annual' ? selectedPlan.annualPrice! : selectedPlan.monthlyPrice!)}
                  </p>
                  <p className="text-sm text-slate-400">
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
