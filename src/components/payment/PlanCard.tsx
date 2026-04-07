import React from 'react';
import { IPlan } from '@/lib/models/Plan';

interface PlanCardProps {
  plan: IPlan;
  billing: 'monthly' | 'annual';
  onSelect: (planId: string, billing: 'monthly' | 'annual') => void;
  isPopular?: boolean;
  loading?: boolean;
  currentPlanId?: string;
}

const PlanCard: React.FC<PlanCardProps> = ({ 
  plan, 
  billing, 
  onSelect, 
  isPopular = false, 
  loading = false,
  currentPlanId 
}) => {
  const price = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const isCurrentPlan = currentPlanId === plan._id.toString();

  if (!price) {
    return null;
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getOriginalPrice = () => {
    return price * 1.38; // Calcula o preço "original" para mostrar desconto
  };

  return (
    <div className={`
      relative rounded-2xl p-8 transition-all duration-300
      ${isPopular 
        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500/50 shadow-xl shadow-purple-500/20' 
        : 'bg-slate-800/50 border border-slate-700/50'
      }
      ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}
      hover:scale-105
    `}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
          ⭐ Melhor Plano
          </span>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Plano Atual
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-slate-400 text-sm">{plan.description}</p>
      </div>

      {/* Pricing */}
      <div className="text-center mb-8">
        {/* Original Price (strikethrough) */}
        <div className="mb-2">
          <span className="text-2xl font-bold text-slate-500 line-through">
            {formatPrice(getOriginalPrice())}
          </span>
        </div>
        
        {/* Current Price */}
        <div className="flex items-baseline justify-center gap-1 mb-3">
          <span className="text-4xl font-bold text-white">
            {formatPrice(price)}
          </span>
          <span className="text-slate-400 text-lg">
            /mês
          </span>
        </div>

        {/* Trial Badge */}
        {plan.trialDays && plan.trialDays > 0 && (
          <div className="inline-block">
            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium border border-yellow-500/30">
              {plan.trialDays} dias grátis
            </span>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
              <svg 
                className="w-3 h-3 text-green-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <span className="text-slate-300 text-sm leading-relaxed">{feature}</span>
          </div>
        ))}
      </div>

      {/* Button */}
      <button
        onClick={() => onSelect(plan._id.toString(), billing)}
        disabled={loading || isCurrentPlan}
        className={`
          w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 text-base
          ${loading || isCurrentPlan
            ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' 
            : isPopular
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
            : 'bg-slate-700 hover:bg-slate-600 text-white'
          }
        `}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : isCurrentPlan ? (
          'Plano Ativo'
        ) : (
          'Fazer Upgrade'
        )}
      </button>
    </div>
  );
};

export default PlanCard;
