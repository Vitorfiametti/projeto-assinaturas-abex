// scripts/seed.js
/**
 * Popula o banco com dados de teste:
 * - 1 admin
 * - 2 usuários
 * - 2 planos (0.01 e 1.00)
 * - 2 conteúdos (1 restrito, 1 público)
 * - 1 assinatura
 * - 2 pagamentos mock (com mercadoPagoId únicos)
 *
 * Uso:
 * NODE_ENV=development MONGODB_URI="mongodb+srv://<user>:<pass>@.../test" node scripts/seed.js
 */

const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/abex-test";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: { type: String, default: "member" },
  subscriptionStatus: { type: String, default: "Inactive" },
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

// Note: usamos "mercadoPagoId" para bater com o schema do projeto (evita duplicate key null)
const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  mercadoPagoId: { type: String, index: true }, // não definimos unique aqui para evitar erro ao inserir (índice único pode já existir no DB real)
  amount: Number,
  status: String,
  paidAt: Date,
  createdAt: Date,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ownerName: String,
  ownerEmail: String,
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

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  startDate: Date,
  endDate: Date,
  status: { type: String, default: "active" },
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
      subscriptionStatus: "Inactive",
    });

    const user1 = await User.create({
      name: "Usuario Teste 1",
      email: "user1@teste.local",
      role: "member",
      subscriptionStatus: "Inactive",
    });

    const user2 = await User.create({
      name: "Usuario Teste 2",
      email: "user2@teste.local",
      role: "member",
      subscriptionStatus: "Inactive",
    });

    const planTiny = await Plan.create({
      name: "Plano Minimo (R$0.01)",
      description: "Plano de teste com valor mínimo (sandbox).",
      price: 0.01,
      monthlyPrice: 0.01,
      features: ["Acesso mínimo para testes"],
      trialDays: 0,
      isActive: true,
    });

    const planSmall = await Plan.create({
      name: "Plano Pequeno (R$1.00)",
      description: "Plano de teste com R$1.00 (fallback caso 0.01 seja rejeitado).",
      price: 1.0,
      monthlyPrice: 1.0,
      features: ["Acesso básico"],
      trialDays: 0,
      isActive: true,
    });

    const publicContent = await Content.create({
      title: "Conteúdo Público - Teste",
      description: "Conteúdo de teste aberto a todos.",
      restricted: false,
      planId: null,
      views: 0,
      thumbnailUrl: "",
    });

    const restrictedContent = await Content.create({
      title: "Conteúdo Restrito - Teste",
      description: "Conteúdo exclusivo para assinantes.",
      restricted: true,
      planId: planTiny._id,
      views: 0,
      thumbnailUrl: "",
    });

    // assinatura sample
    const now = new Date();
    const oneMonth = new Date(now);
    oneMonth.setMonth(oneMonth.getMonth() + 1);

    const subscription1 = await Subscription.create({
      userId: user1._id,
      planId: planSmall._id,
      startDate: now,
      endDate: oneMonth,
      status: "active",
    });

    // pagamentos de teste — garantimos mercadoPagoId únicos para não colidir com índice unique existente
    const payment1 = await Payment.create({
      userId: user1._id,
      planId: planSmall._id,
      mercadoPagoId: "TEST-MP-APPROVED-001",
      amount: 1.0,
      status: "approved",
      paidAt: new Date(),
      createdAt: new Date(),
      ownerId: admin._id,
      ownerName: admin.name,
      ownerEmail: admin.email,
    });

    const payment2 = await Payment.create({
      userId: user2._id,
      planId: planTiny._id,
      mercadoPagoId: "TEST-MP-PENDING-002",
      amount: 0.01,
      status: "pending",
      createdAt: new Date(),
      ownerId: admin._id,
      ownerName: admin.name,
      ownerEmail: admin.email,
    });

    // eventos de teste distribuídos por região
    const baseDate = new Date();
    const events = await Event.insertMany([
      {
        title: "Churrasco da Atlética",
        description: "Evento aberto para todos os membros.",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 10, 18, 0),
        location: "Sede da Atlética",
        region: "Sul",
        restricted: false,
      },
      {
        title: "Torneio de Futsal",
        description: "Competição interna entre cursos.",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 15, 14, 0),
        location: "Ginásio Central",
        region: "Sul",
        restricted: false,
      },
      {
        title: "Workshop de Empreendedorismo",
        description: "Evento exclusivo para assinantes.",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 20, 9, 0),
        location: "Auditório Bloco A",
        region: "Sudeste",
        restricted: true,
        planId: planTiny._id,
      },
      {
        title: "Festa Junina Universitária",
        description: "Quadrilha, comidas típicas e muito mais.",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 24, 20, 0),
        location: "Pátio Central",
        region: "Nordeste",
        restricted: false,
      },
      {
        title: "Semana Acadêmica",
        description: "Palestras e minicursos durante toda a semana.",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 28, 8, 0),
        location: "Campus Norte",
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
        { id: planSmall._id, name: planSmall.name, price: planSmall.price }
      ],
      contents: [
        { id: publicContent._id, title: publicContent.title },
        { id: restrictedContent._id, title: restrictedContent.title }
      ],
      events: events.map(e => ({ id: e._id, title: e.title, region: e.region, date: e.date })),
      payments: [
        { id: payment1._id, mercadoPagoId: payment1.mercadoPagoId, amount: payment1.amount, status: payment1.status },
        { id: payment2._id, mercadoPagoId: payment2.mercadoPagoId, amount: payment2.amount, status: payment2.status }
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