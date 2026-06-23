// src/pages/api/admin/events.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { connectMongoose } from "@/lib/mongodb";
import { authOptions } from "../auth/[...nextauth]";
import Event from "@/lib/models/Event";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json");

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Acesso negado. Permissões de administrador necessárias." });
    }

    await connectMongoose();

    switch (req.method) {
      case "GET": {
        const events = await Event.find({}).sort({ date: 1 });
        return res.status(200).json({ success: true, data: events });
      }

      case "POST": {
        const { title, description, date, location, region, restricted } = req.body;
        if (!title || !description || !date || !location || !region) {
          return res.status(400).json({ success: false, message: "Preencha todos os campos obrigatórios." });
        }
        const newEvent = await Event.create({ title, description, date, location, region, restricted: restricted || false });
        return res.status(201).json({ success: true, message: "Evento criado com sucesso!", data: newEvent });
      }

      case "PUT": {
        const { id, ...updateData } = req.body;
        if (!id) return res.status(400).json({ success: false, message: "ID do evento é obrigatório." });
        const updated = await Event.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ success: false, message: "Evento não encontrado." });
        return res.status(200).json({ success: true, message: "Evento atualizado com sucesso!", data: updated });
      }

      case "DELETE": {
        const { id } = req.query;
        if (!id || typeof id !== "string") return res.status(400).json({ success: false, message: "ID do evento é obrigatório." });
        const deleted = await Event.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: "Evento não encontrado." });
        return res.status(200).json({ success: true, message: "Evento excluído com sucesso." });
      }

      default:
        return res.status(405).json({ success: false, message: "Método não permitido." });
    }
  } catch (error: any) {
    console.error("❌ Erro em admin/events:", error.message);
    return res.status(500).json({ success: false, message: "Erro interno do servidor.", error: error.message });
  }
}