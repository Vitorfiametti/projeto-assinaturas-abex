import React from 'react';
import { IPlan } from '@/lib/models/Plan';
import { ArrowRight, Check } from 'lucide-react';

interface PlanCardProps {
  plan: IPlan;
  billing: 'monthly' | 'annual';
  onSelect: (planId: string, billing: 'monthly' | 'annual') => void;
  isPopular?: boolean;
  loading?: boolean;
  currentPlanId?: string;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan, billing, onSelect, isPopular = false, loading = false, currentPlanId
}) => {
  const price = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const isCurrentPlan = currentPlanId === plan._id.toString();

  if (!price) return null;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div
      className="relative flex flex-col p-6 transition-all duration-200"
      style={{
        backgroundColor: 'var(--dark-card-2)',
        border: isPopular ? '1px solid var(--teal)' : '1px solid #333',
        borderRadius: 16,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--teal)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = isPopular ? 'var(--teal)' : '#333'; }}
    >
      {/* Popular Badges */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap">
          <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: 'var(--accent)' }}>
            O MAIS HYPADO 🔥
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: 'var(--teal)', color: '#111' }}>
            MELHOR PREÇO
          </span>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3.5 right-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: 'var(--teal)', color: '#111' }}>
            Plano Atual ✓
          </span>
        </div>
      )}

      {/* Logo Mark */}
      <div className="font-black text-lg mb-3 italic" style={{ color: 'var(--teal)' }}>A!</div>

      {/* Plan Name */}
      <h3 className="text-2xl font-black uppercase text-white mb-1 flex items-center justify-between">
        {plan.name}
        <ArrowRight className="w-5 h-5" style={{ color: '#666' }} />
      </h3>

      {/* Price */}
      <div className="mb-1">
        <span className="text-2xl font-bold" style={{ color: 'var(--teal)' }}>
          {formatPrice(price)}
        </span>
        <span className="text-sm ml-1" style={{ color: '#888' }}>/mês</span>
      </div>

      {/* Billing info */}
      {billing === 'annual' && plan.annualPrice && (
        <p className="text-xs mb-1" style={{ color: '#888' }}>
          Ou {formatPrice(plan.annualPrice)} por ano
        </p>
      )}
      <p className="text-xs mb-4" style={{ color: '#888' }}>
        No PIX, Débito ou Crédito
      </p>

      {/* Description */}
      <p className="text-sm font-medium text-white mb-5 leading-relaxed flex-1">
        {plan.description}
      </p>

      {/* Trial badge */}
      {plan.trialDays !== undefined && plan.trialDays > 0 && (
        <span className="mb-4 inline-block text-xs font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(0,201,177,0.15)', color: 'var(--teal)' }}>
          {plan.trialDays} dias grátis
        </span>
      )}

      {/* Features */}
      {plan.features && plan.features.length > 0 && (
        <ul className="space-y-2 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm" style={{ color: '#aaa' }}>
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal)' }} />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* CTA Button */}
      <button
        onClick={() => onSelect(plan._id.toString(), billing)}
        disabled={loading || isCurrentPlan}
        className="w-full py-3 px-5 rounded-xl text-sm font-bold flex items-center justify-between transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={
          isCurrentPlan
            ? { backgroundColor: '#333', color: '#666', cursor: 'not-allowed' }
            : { backgroundColor: 'var(--accent)', color: 'white' }
        }
      >
        {loading ? (
          <div className="flex items-center gap-2 w-full justify-center">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processando...
          </div>
        ) : isCurrentPlan ? (
          <span className="w-full text-center">Plano Ativo</span>
        ) : (
          <>
            <span>Assinar</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};

export default PlanCard;
