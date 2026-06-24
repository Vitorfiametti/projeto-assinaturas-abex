// src/pages/member/plans.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { PlanCard, PaymentModal } from "@/components/payment";
import { IPlan } from "@/lib/models/Plan";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Layout from "@/components/Layout";
import { connectMongoose } from "@/lib/mongodb";
import Plan from "@/lib/models/Plan";
import { useLanguage } from "@/context/LanguageContext";
import { Shield, RefreshCw, Headphones } from "lucide-react";

interface PlansPageProps {
  plans: IPlan[];
  currentPlanId?: string;
}

export default function PlansPage({ plans, currentPlanId }: PlansPageProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const handleSelect = (planId: string, billingType: "monthly" | "annual") => {
    const found = plans.find((p) => p._id.toString() === planId);
    if (!found) return;
    setSelectedPlan(found);
    setBilling(billingType);
    setIsPaymentOpen(true);
  };

  const guarantees = [
    { icon: Shield, title: t("plans.features.secure.title"), description: t("plans.features.secure.description") },
    { icon: RefreshCw, title: t("plans.features.guarantee.title"), description: t("plans.features.guarantee.description") },
    { icon: Headphones, title: t("plans.features.support.title"), description: t("plans.features.support.description") },
  ];

  return (
    <Layout activeTab="plans">
      {/* Header — light background */}
      <div className="px-4 pt-16 pb-10 text-center" style={{ backgroundColor: 'var(--bg)' }}>
        <h1
          className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-3"
          style={{ color: 'var(--text)' }}
        >
          ESCOLHA SEU PLANO
        </h1>
        <p className="text-lg max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
          {t("plans.subtitle")}
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className="text-sm font-semibold" style={{ color: billing === 'monthly' ? 'var(--text)' : 'var(--text-muted)' }}>
            Mensal
          </span>
          <button
            onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
            className="relative w-14 h-7 rounded-full transition-colors duration-300"
            style={{ backgroundColor: billing === 'annual' ? 'var(--teal)' : 'var(--border)' }}>
            <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${billing === 'annual' ? 'translate-x-7' : ''}`} />
          </button>
          <span className="text-sm font-semibold" style={{ color: billing === 'annual' ? 'var(--text)' : 'var(--text-muted)' }}>
            Anual
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'var(--teal)', color: '#111' }}>
            ECONOMIZE
          </span>
        </div>
      </div>

      {/* Plans — dark section like Cheers */}
      <div className="py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#1a1a1a' }}>
        {plans.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold mb-2 text-white">{t("plans.noPlans")}</h3>
            <p style={{ color: '#888' }}>{t("plans.contactSupport")}</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan._id.toString()}
                plan={plan}
                billing={billing}
                currentPlanId={currentPlanId}
                onSelect={handleSelect}
                isPopular={index === 0}
              />
            ))}
          </div>
        )}

        {/* How to use */}
        <div className="max-w-5xl mx-auto mt-16">
          <h2 className="text-2xl font-black uppercase text-white text-center mb-8">
            COMO FUNCIONA?
          </h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { step: '01', text: 'Escolha seu plano' },
              { step: '02', text: 'Faça o pagamento' },
              { step: '03', text: 'Acesse seu perfil' },
              { step: '04', text: 'Aproveite os benefícios!' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-2">
                <span className="text-3xl font-black" style={{ color: 'var(--teal)' }}>{item.step}</span>
                <p className="text-sm text-white font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guarantees — back to light */}
      <div className="py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {guarantees.map((item, i) => (
            <div key={i} className="rounded-2xl p-6 text-center t-card">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--teal-subtle)' }}>
                <item.icon className="w-5 h-5" style={{ color: 'var(--teal)' }} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text)' }}>{item.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => { setIsPaymentOpen(false); setSelectedPlan(null); }}
          plans={[selectedPlan]}
          currentPlanId={currentPlanId}
          onPaymentSuccess={() => { setIsPaymentOpen(false); router.reload(); }}
        />
      )}
    </Layout>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }

  try {
    await connectMongoose();
    const plansFromDb = await Plan.find({ isActive: true }).sort({ monthlyPrice: -1 }).lean().exec();
    return {
      props: {
        plans: JSON.parse(JSON.stringify(plansFromDb)),
        currentPlanId: null,
      },
    };
  } catch (err: any) {
    console.error("❌ SSR ERROR:", err.message);
    return { props: { plans: [], currentPlanId: null } };
  }
}
