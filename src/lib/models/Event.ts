// src/lib/models/Event.ts
import mongoose from 'mongoose';

export interface IEvent extends mongoose.Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  region: string;
  restricted: boolean;
  planId?: mongoose.Schema.Types.ObjectId;
  imageUrl?: string;
}

const EventSchema = new mongoose.Schema<IEvent>({
  title: {
    type: String,
    required: [true, 'Informe o título do evento.'],
    maxlength: [100, 'Título não pode exceder 100 caracteres.'],
  },
  description: {
    type: String,
    required: [true, 'Informe a descrição do evento.'],
  },
  date: {
    type: Date,
    required: [true, 'Informe a data do evento.'],
  },
  location: {
    type: String,
    required: [true, 'Informe o local do evento.'],
  },
  region: {
    type: String,
    required: [true, 'Informe a região do evento.'],
  },
  restricted: {
    type: Boolean,
    default: false,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
  },
  imageUrl: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);