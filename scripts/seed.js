// scripts/seed.js
/**
 * Popula o banco com dados de teste:
 * - 1 admin
 * - 2 usuários (1 assinante ativo, 1 sem assinatura)
 * - 2 planos (0.01 e 1.00)
 * - 2 conteúdos (1 restrito, 1 público)
 * - 1 assinatura ativa
 * - 2 pagamentos mock (mpPaymentId únicos)
 * - 5 eventos distribuídos por região
 *
 * Uso:
 * NODE_ENV=development MONGODB_URI="mongodb+srv://<user>:<pass>@.../test" node scripts/seed.js
 */

const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/abex-test";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ["admin", "member"], default: "member" },
  subscriptionStatus: { type: String, enum: ["active", "inactive", "cancelled", "expired"], default: "inactive" },
}, { timestamps: true });

const planSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: { type: Number, required: true, min: 0 },
  monthlyPrice: Number,
  annualPrice: Number,
  features: [String],
  trialDays: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const contentSchema = new mongoose.Schema({
  title: String,
  description: String,
  restricted: { type: Boolean, default: false },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", default: null },
  views: { type: Number, default: 0 },
  lastViewedAt: Date,
  thumbnailUrl: String,
}, { timestamps: true });

// Alinhado com src/lib/models/Payment.ts — campo correto é "mpPaymentId" (unique)
const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
  mpPaymentId: { type: String, required: true, unique: true },
  preferenceId: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: "BRL" },
  status: { type: String, enum: ["pending", "approved", "rejected", "cancelled", "refunded"], default: "pending" },
  paymentMethod: String,
  paidAt: Date,
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  location: String,
  region: String,
  restricted: { type: Boolean, default: false },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", default: null },
  imageUrl: String,
}, { timestamps: true });

// Alinhado com src/lib/models/Subscription.ts — inclui autoRenew
const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  status: { type: String, enum: ["pending", "active", "inactive", "cancelled", "expired"], default: "pending" },
  startDate: Date,
  endDate: Date,
  autoRenew: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Plan = mongoose.models.Plan || mongoose.model("Plan", planSchema);
const Content = mongoose.models.Content || mongoose.model("Content", contentSchema);
const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
const Subscription = mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

async function main() {
  console.log("🔌 Conectando ao Mongo:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI, {});

  try {
    console.log("🧹 Limpando coleções (se existirem)...");
    // Apaga documentos — NÃO dropa índices para manter segurança (se existir unique index, garantimos valores únicos abaixo)
    await Promise.all([
      User.deleteMany({}),
      Plan.deleteMany({}),
      Content.deleteMany({}),
      Payment.deleteMany({}),
      Subscription.deleteMany({}),
      Event.deleteMany({}),
    ]);

    console.log("🌱 Inserindo dados de teste...");

    const admin = await User.create({
      name: "Admin Teste",
      email: "admin@teste.local",
      role: "admin",
      subscriptionStatus: "inactive",
    });

    // user1 — assinante ativo (tem assinatura e pagamento aprovado)
    const user1 = await User.create({
      name: "Usuario Teste 1",
      email: "user1@teste.local",
      role: "member",
      subscriptionStatus: "active",
    });

    // user2 — sem assinatura (pagamento pendente)
    const user2 = await User.create({
      name: "Usuario Teste 2",
      email: "user2@teste.local",
      role: "member",
      subscriptionStatus: "inactive",
    });

    const planTiny = await Plan.create({
      name: "Plano Mensal",
      description: "Acesso mensal a todos os eventos e benefícios da casa.",
      price: 30.0,
      monthlyPrice: 30.0,
      features: ["Acesso a eventos exclusivos", "Desconto em ingressos", "Suporte prioritário"],
      trialDays: 0,
      isActive: true,
    });

    const planSmall = await Plan.create({
      name: "Plano Semestral",
      description: "Acesso semestral com desconto especial.",
      price: 150.0,
      monthlyPrice: 25.0,
      features: ["Acesso a eventos exclusivos", "Desconto em produtos", "Suporte prioritário", "Economia de R$30 no semestre"],
      trialDays: 0,
      isActive: true,
    });

    const planAnual = await Plan.create({
      name: "Plano Anual",
      description: "Acesso anual com o melhor custo-benefício.",
      price: 250.0,
      monthlyPrice: 20.83,
      annualPrice: 250.0,
      features: ["Acesso a eventos exclusivos", "Desconto em produtos", "Suporte prioritário", "Economia de R$110 no ano", "Brindes exclusivos"],
      trialDays: 0,
      isActive: true,
    });

    const publicContent = await Content.create({
      title: "Guia de Boas-Vindas à Casa de Eventos",
      description: "Tudo que você precisa saber para aproveitar ao máximo os benefícios da nossa plataforma.",
      restricted: false,
      planId: null,
      views: 42,
      thumbnailUrl: "",
    });

    const restrictedContent = await Content.create({
      title: "Bastidores: Produção dos Eventos Exclusivos",
      description: "Conteúdo exclusivo para assinantes — veja como preparamos cada evento, bastidores e dicas dos organizadores.",
      restricted: true,
      planId: planTiny._id,
      views: 18,
      thumbnailUrl: "",
    });

    // assinatura sample
    const now = new Date();
    const oneMonth = new Date(now);
    oneMonth.setMonth(oneMonth.getMonth() + 1);

    const subscription1 = await Subscription.create({
      userId: user1._id,
      planId: planSmall._id,
      status: "active",
      startDate: now,
      endDate: oneMonth,
      autoRenew: true,
    });

    // pagamentos de teste — campo correto é mpPaymentId (alinhado com Payment.ts)
    const payment1 = await Payment.create({
      userId: user1._id,
      planId: planSmall._id,
      subscriptionId: subscription1._id,
      mpPaymentId: "TEST-MP-APPROVED-001",
      preferenceId: "TEST-PREF-001",
      amount: 1.0,
      currency: "BRL",
      status: "approved",
      paymentMethod: "pix",
      paidAt: new Date(),
    });

    const payment2 = await Payment.create({
      userId: user2._id,
      planId: planTiny._id,
      mpPaymentId: "TEST-MP-PENDING-002",
      preferenceId: "TEST-PREF-002",
      amount: 0.01,
      currency: "BRL",
      status: "pending",
      paymentMethod: "pix",
    });

    // eventos de teste distribuídos por região
    const baseDate = new Date();
    const events = await Event.insertMany([
      {
        title: "Noite de Gala — Aniversário da Casa",
        description: "Celebração especial com jantar temático, música ao vivo e surpresas para todos os membros.",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 10, 20, 0),
        location: "Salão Principal — Casa de Eventos Central",
        region: "Sul",
        restricted: false,
      },
      {
        title: "Festival Gastronômico",
        description: "Noite com chefs convidados, degustação de pratos exclusivos e harmonização de bebidas.",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 15, 19, 0),
        location: "Terraço da Casa",
        region: "Sul",
        restricted: false,
      },
      {
        title: "Workshop: Organização de Eventos",
        description: "Evento exclusivo para assinantes — aprenda os bastidores da produção de eventos de alto padrão com especialistas do setor.",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 20, 9, 0),
        location: "Sala VIP — Bloco A",
        region: "Sudeste",
        restricted: true,
        planId: planTiny._id,
      },
      {
        title: "Festa Temática: Anos 80",
        description: "Uma noite de nostalgia com playlist retrô, fantasias e muita animação.",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 24, 21, 0),
        location: "Pista Principal",
        region: "Nordeste",
        restricted: false,
      },
      {
        title: "Encontro de Membros — Networking",
        description: "Tarde de networking e troca de experiências entre membros da plataforma. Coffee break incluso.",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 28, 15, 0),
        location: "Lounge da Casa",
        region: "Centro-Oeste",
        restricted: false,
      },
    ]);

    console.log("✅ Seed completo!");
    console.log({
      admin: { id: admin._id, email: admin.email },
      users: [
        { id: user1._id, email: user1.email },
        { id: user2._id, email: user2.email }
      ],
      plans: [
        { id: planTiny._id, name: planTiny.name, price: planTiny.price },
        { id: planSmall._id, name: planSmall.name, price: planSmall.price },
        { id: planAnual._id, name: planAnual.name, price: planAnual.price }
      ],
      contents: [
        { id: publicContent._id, title: publicContent.title },
        { id: restrictedContent._id, title: restrictedContent.title }
      ],
      events: events.map(e => ({ id: e._id, title: e.title, region: e.region, date: e.date })),
      payments: [
        { id: payment1._id, mpPaymentId: payment1.mpPaymentId, amount: payment1.amount, status: payment1.status },
        { id: payment2._id, mpPaymentId: payment2.mpPaymentId, amount: payment2.amount, status: payment2.status }
      ]
    });

  } catch (err) {
    console.error("❌ Erro ao rodar seed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Desconectado do Mongo.");
    process.exit(0);
  }
}

main();