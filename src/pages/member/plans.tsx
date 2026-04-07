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

// IMPORTANTE: adicionar o hook de linguagem
import { useLanguage } from "@/context/LanguageContext";

interface PlansPageProps {
  plans: IPlan[];
  currentPlanId?: string;
}

export default function PlansPage({ plans, currentPlanId }: PlansPageProps) {
  const router = useRouter();

  // hook de linguagem
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

  return (
    <Layout activeTab="plans">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">

        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {t("plans.title")}{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {t("plans.titleHighlight")}
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {t("plans.subtitle")}
            </p>
          </div>

          {/* Toggle Mensal / Anual */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-lg font-medium transition-colors ${billing === 'monthly' ? 'text-white' : 'text-slate-500'}`}>
              {t("plans.monthly")}
            </span>

            <button
              onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-16 h-8 bg-slate-700 rounded-full border border-slate-600 transition-colors"
            >
              <span className={`absolute left-1 top-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg transform transition-transform duration-300 ${
                billing === 'annual' ? 'translate-x-8' : ''
              }`} />
            </button>

            <span className={`text-lg font-medium transition-colors ${billing === 'annual' ? 'text-white' : 'text-slate-500'}`}>
              {t("plans.annual")}
            </span>

            <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white text-sm font-medium">
              {t("plans.save")}
            </div>
          </div>

          {/* Lista de planos */}
          {plans.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-white mb-2">{t("plans.noPlans")}</h3>
              <p className="text-slate-400">{t("plans.contactSupport")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

          {/* Informações adicionais */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/30 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">{t("plans.features.secure.title")}</h3>
              <p className="text-slate-400">{t("plans.features.secure.description")}</p>
            </div>

            <div className="bg-slate-800/30 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">{t("plans.features.guarantee.title")}</h3>
              <p className="text-slate-400">{t("plans.features.guarantee.description")}</p>
            </div>

            <div className="bg-slate-800/30 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">{t("plans.features.support.title")}</h3>
              <p className="text-slate-400">{t("plans.features.support.description")}</p>
            </div>
          </div>
        </div>

        {/* Modal */}
        {selectedPlan && (
          <PaymentModal
            isOpen={isPaymentOpen}
            onClose={() => {
              setIsPaymentOpen(false);
              setSelectedPlan(null);
            }}
            plans={[selectedPlan]}
            currentPlanId={currentPlanId}
            onPaymentSuccess={() => {
              setIsPaymentOpen(false);
              router.reload();
            }}
          />
        )}
      </div>
    </Layout>
  );
}

// ✅ getServerSideProps
export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  try {
    await connectMongoose();
    
    const plansFromDb = await Plan.find({ isActive: true })
    .sort({ monthlyPrice: -1 })
    .lean()
    .exec();
    
    const serializedPlans = JSON.parse(JSON.stringify(plansFromDb));

    return {
      props: {
        plans: serializedPlans,
        currentPlanId: null,
      },
    };
  } catch (err: any) {
    console.error("❌ SSR ERROR:", err.message);
    
    return { 
      props: { 
        plans: [], 
        currentPlanId: null 
      } 
    };
  }
}
