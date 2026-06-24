// src/pages/index.tsx
import Layout from '@/components/Layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Crown, Users, Star, Check, ArrowRight,
  Calendar, FileText, Video, Shield, Headphones,
  X, Zap, Award,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  useEffect(() => {
    if (router.query.deleted === 'true') {
      setShowDeleteSuccess(true);
      const { deleted, ...rest } = router.query;
      router.replace({ pathname: '/', query: rest }, undefined, { shallow: true });
      setTimeout(() => setShowDeleteSuccess(false), 5000);
    }
  }, [router]);

  const stats = [
    { number: '10.000+', label: 'membros ativos' },
    { number: '4.9 ★', label: '+10mil avaliações' },
    { number: '500+', label: 'conteúdos exclusivos' },
    { number: '24/7', label: 'suporte disponível' },
  ];

  const contentTypes = [
    {
      icon: FileText,
      title: 'Artigos Premium',
      description: 'Conteúdo aprofundado e insights exclusivos de especialistas.',
    },
    {
      icon: Video,
      title: 'Vídeos Exclusivos',
      description: 'Cursos avançados e webinars sob demanda para membros.',
    },
    {
      icon: Calendar,
      title: 'Eventos VIP',
      description: 'Acesso exclusivo a eventos presenciais e experiências únicas.',
    },
  ];

  const plans = [
    {
      name: 'ANUAL',
      price: 'R$ 20,83',
      total: 'Ou R$ 250,00 por ano',
      payment: 'No PIX, Débito ou Crédito em até 12x',
      desc: 'Um ano inteiro de vantagens e bons momentos 🥂',
      badge: 'O MAIS HYPADO 🔥',
      pct: '35% OFF',
      href: '/member/plans',
    },
    {
      name: 'SEMESTRAL',
      price: 'R$ 25,00',
      total: 'Ou R$ 150,00 ao semestre',
      payment: 'No PIX, Débito ou Crédito em até 12x',
      desc: '6 meses de economia pra curtir sem culpa ✨',
      href: '/member/plans',
    },
    {
      name: 'MENSAL',
      price: 'R$ 30,00',
      total: 'No Crédito',
      payment: '',
      desc: 'Aproveite as vantagens Clube um mês de cada vez ❤️',
      href: '/member/plans',
    },
  ];

  const testimonials = [
    { name: 'Maria S.', role: 'Membro há 1 ano', content: 'A melhor decisão que tomei! Os eventos exclusivos são incríveis.', rating: 5 },
    { name: 'João P.', role: 'Membro há 6 meses', content: 'O custo-benefício é excelente. Recomendo para todos!', rating: 5 },
    { name: 'Ana C.', role: 'Membro há 2 anos', content: 'Conteúdo de altíssima qualidade. Vale muito a pena!', rating: 5 },
  ];

  return (
    <Layout activeTab="home">
      {/* Success toast */}
      {showDeleteSuccess && (
        <div className="fixed top-20 right-4 z-50 animate-fadeIn">
          <div className="rounded-xl p-4 shadow-lg max-w-sm flex items-start gap-3"
            style={{ backgroundColor: '#16a34a', color: 'white' }}>
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Conta deletada com sucesso</p>
              <p className="text-xs opacity-80">Todos os seus dados foram removidos.</p>
            </div>
            <button onClick={() => setShowDeleteSuccess(false)} className="ml-auto opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── HERO ────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
              style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              <Zap className="w-4 h-4" />
              A plataforma da sua casa de eventos
            </div>

            <h1 className="text-5xl sm:text-6xl font-black uppercase leading-tight mb-4" style={{ color: 'var(--text)' }}>
              ACESSE E{' '}
              <span style={{ color: 'var(--accent)' }}>GERENCIE</span>
              <br />
              sua{' '}
              <span style={{ color: 'var(--teal)', fontStyle: 'italic' }}>CASA DE EVENTOS</span>
            </h1>

            <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Faça login, escolha seu plano e acesse conteúdos premium, eventos exclusivos e uma comunidade VIP.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={session ? '/member/plans' : '/auth/signin'}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--accent)' }}>
                Explorar planos
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={session ? '/member/content' : '/auth/signin'}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-opacity hover:opacity-80"
                style={{ border: '2px solid var(--text)', color: 'var(--text)' }}>
                Ver conteúdos →
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-8 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex -space-x-2">
                {['A', 'B', 'C', 'D', 'E'].map((l) => (
                  <div key={l} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2"
                    style={{ backgroundColor: 'var(--accent)', borderColor: 'var(--bg)' }}>
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>10.000+ membros ativos</p>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" style={{ color: '#f59e0b' }} />)}
                  <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>4.9/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Feature preview cards */}
          <div className="relative">
            <div className="rounded-3xl p-8 shadow-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                    <Video className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Vídeos Exclusivos</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cursos Avançados</p>
                  </div>
                  <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--teal-subtle)', color: 'var(--teal)' }}>NOVO</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(0,201,177,0.1)' }}>
                    <FileText className="w-5 h-5" style={{ color: 'var(--teal)' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Artigos Premium</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Conteúdo aprofundado</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                    <Users className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Comunidade VIP</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Eventos exclusivos e networking</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: 'var(--accent)' }}>
              <Crown className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────── */}
      <section className="py-12 px-4" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-3xl font-black mb-1" style={{ color: 'var(--text)' }}>{s.number}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTENT TYPES ───────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black uppercase mb-3" style={{ color: 'var(--text)' }}>
              EXPLORE OS <span style={{ color: 'var(--teal)' }}>BENEFÍCIOS</span>
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
              São + 500 conteúdos exclusivos para membros
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {contentTypes.map((item, i) => (
              <div key={i} className="p-6 rounded-2xl t-card t-card-hover">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: i % 2 === 0 ? 'var(--accent-subtle)' : 'var(--teal-subtle)' }}>
                  <item.icon className="w-6 h-6" style={{ color: i % 2 === 0 ? 'var(--accent)' : 'var(--teal)' }} />
                </div>
                <h3 className="text-lg font-black mb-2" style={{ color: 'var(--text)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS — DARK SECTION ─────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-center text-white mb-3">
            ESCOLHA SEU PLANO
          </h2>
          <p className="text-center mb-12" style={{ color: '#888' }}>
            São + 200 benefícios por menos de R$ 30/mês
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={i}
                className="relative flex flex-col p-6 transition-all duration-200"
                style={{
                  backgroundColor: '#2a2a2a',
                  border: i === 0 ? '1px solid var(--teal)' : '1px solid #333',
                  borderRadius: 16,
                }}
              >
                {/* Badges */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: 'var(--accent)' }}>{plan.badge}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: 'var(--teal)', color: '#111' }}>{plan.pct}</span>
                  </div>
                )}

                <div className="font-black text-lg mb-2 italic" style={{ color: 'var(--teal)' }}>A!</div>
                <h3 className="text-2xl font-black text-white uppercase mb-1 flex items-center justify-between">
                  {plan.name} <ArrowRight className="w-5 h-5" style={{ color: '#666' }} />
                </h3>
                <div className="mb-1">
                  <span className="text-2xl font-bold" style={{ color: 'var(--teal)' }}>{plan.price}</span>
                  <span className="text-sm ml-1" style={{ color: '#888' }}>/mês</span>
                </div>
                <p className="text-xs mb-1" style={{ color: '#888' }}>{plan.total}</p>
                {plan.payment && <p className="text-xs mb-4" style={{ color: '#888' }}>{plan.payment}</p>}
                <p className="text-sm font-medium text-white mb-6 flex-1 mt-2">{plan.desc}</p>

                <Link
                  href={session ? plan.href : '/auth/signin'}
                  className="w-full py-3 px-5 rounded-xl text-sm font-bold flex items-center justify-between transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
                  <span>Assinar</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* How to use */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-black uppercase text-white mb-8">COMO UTILIZAR?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { n: '01', text: 'Escolha seu plano' },
                { n: '02', text: 'Faça o pagamento via PIX ou cartão' },
                { n: '03', text: 'Acesse sua conta' },
                { n: '04', text: 'Aproveite sem moderação!' },
              ].map(item => (
                <div key={item.n} className="flex flex-col items-center gap-2">
                  <span className="text-3xl font-black" style={{ color: 'var(--teal)' }}>{item.n}</span>
                  <p className="text-sm text-white font-medium leading-tight">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-center mb-12" style={{ color: 'var(--text)' }}>
            O QUE DIZEM NOSSOS <span style={{ color: 'var(--accent)' }}>MEMBROS</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl t-card">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" style={{ color: '#f59e0b' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: 'var(--accent)' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────── */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-2xl mx-auto">
          <Award className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--teal)' }} />
          <h2 className="text-3xl sm:text-4xl font-black uppercase mb-4" style={{ color: 'var(--text)' }}>
            PRONTO PARA <span style={{ color: 'var(--accent)' }}>CURTIR</span>?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
            Junte-se a mais de 10.000 membros e tenha acesso a experiências exclusivas da sua atlética.
          </p>
          <Link
            href={session ? '/member/plans' : '/auth/signin'}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-lg text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}>
            {session ? 'Ver meus planos' : 'Entrar agora'}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
