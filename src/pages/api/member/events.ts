// src/pages/api/member/events.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { connectMongoose } from '@/lib/mongodb';
import '@/lib/models';
import Event from '@/lib/models/Event';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ success: false, message: 'Não autorizado. Faça login novamente.' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  try {
    await connectMongoose();

    const { region, month, year } = req.query;

    const filter: Record<string, any> = {};

    // Filtro por região
    if (region && region !== 'all') {
      filter.region = region;
    }

    // Filtro por mês/ano
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const events = await Event.find(filter).sort({ date: 1 });

    // Buscar regiões distintas para o filtro
    const allRegions = await Event.distinct('region');

    return res.status(200).json({
      success: true,
      data: events,
      regions: allRegions,
    });
  } catch (error: any) {
    console.error('❌ Erro ao listar eventos:', error.message);
    return res.status(500).json({ success: false, message: 'Erro interno ao listar eventos.', error: error.message });
  }
}