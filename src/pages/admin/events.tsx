'use client'
// src/pages/admin/events.tsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import {
  CalendarDays, Plus, Edit3, Trash2, Save, X,
  AlertCircle, CheckCircle, MapPin, Clock, Filter,
  Search, Globe, Lock,
} from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  region: string;
  restricted: boolean;
}

const EMPTY_FORM = { title: '', description: '', date: '', location: '', region: '', restricted: false };

function AdminEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/member/plans');
  }, [status, session, router]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/events');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setEvents(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (status === 'authenticated') fetchEvents(); }, [status]);

  const showMsg = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(null), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }
  };

  const openCreate = () => { setForm({ ...EMPTY_FORM }); setEditingId(null); setShowForm(true); };
  const openEdit = (ev: Event) => {
    setForm({
      title: ev.title,
      description: ev.description,
      date: new Date(ev.date).toISOString().slice(0, 16),
      location: ev.location,
      region: ev.region,
      restricted: ev.restricted,
    });
    setEditingId(ev._id);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm({ ...EMPTY_FORM }); };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.date || !form.location || !form.region) {
      showMsg('Preencha todos os campos obrigatórios.', true);
      return;
    }
    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...form } : form;
      const res = await fetch('/api/admin/events', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showMsg(data.message);
      closeForm();
      fetchEvents();
    } catch (err: any) {
      showMsg(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showMsg(data.message);
      setConfirmDelete(null);
      fetchEvents();
    } catch (err: any) {
      showMsg(err.message, true);
    }
  };

  const regions = [...new Set(events.map(e => e.region))];

  const filtered = events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.region.toLowerCase().includes(search.toLowerCase());
    const matchRegion = filterRegion === 'all' || e.region === filterRegion;
    return matchSearch && matchRegion;
  });

  if (status === 'loading') return (
    <Layout activeTab="admin-events">
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    </Layout>
  );

  return (
    <Layout activeTab="admin-events">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Gerenciar Eventos
              </h1>
              <p className="text-slate-400 text-sm">{events.length} evento{events.length !== 1 ? 's' : ''} cadastrado{events.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            Novo Evento
          </button>
        </div>

        {/* Alertas */}
        {error && (
          <div className="mb-4 flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-3 bg-green-900/20 border border-green-500/30 rounded-xl p-4">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 flex-1 min-w-48">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar evento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-slate-300 text-sm outline-none w-full placeholder-slate-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterRegion}
              onChange={e => setFilterRegion(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none"
            >
              <option value="all">Todas as regiões</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="mb-6 bg-slate-800/60 border border-purple-500/30 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">
                {editingId ? 'Editar Evento' : 'Novo Evento'}
              </h2>
              <button onClick={closeForm} className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-slate-300" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Churrasco da Atlética"
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors placeholder-slate-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Descrição *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descreva o evento..."
                  rows={3}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors placeholder-slate-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Data e Hora *</label>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Região *</label>
                <input
                  type="text"
                  value={form.region}
                  onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                  placeholder="Ex: Sul, Sudeste, Nordeste..."
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors placeholder-slate-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Local *</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Ex: Ginásio Central, Auditório Bloco A..."
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors placeholder-slate-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForm(f => ({ ...f, restricted: !f.restricted }))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${form.restricted ? 'bg-purple-600' : 'bg-slate-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.restricted ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm text-slate-300">Evento restrito a assinantes</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button onClick={closeForm} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar Evento'}
              </button>
            </div>
          </div>
        )}

        {/* Lista de eventos */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <CalendarDays className="w-12 h-12 text-slate-600" />
            <p className="text-slate-400">Nenhum evento encontrado.</p>
            <button onClick={openCreate} className="text-purple-400 text-sm hover:text-purple-300 underline">
              Criar primeiro evento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(ev => (
              <div key={ev._id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 hover:border-purple-500/30 transition-all duration-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-white font-semibold text-sm leading-tight">{ev.title}</h3>
                  <span className={`shrink-0 flex items-center gap-1 text-xs rounded-full px-2 py-0.5 border ${ev.restricted ? 'bg-orange-900/30 text-orange-300 border-orange-500/30' : 'bg-green-900/30 text-green-300 border-green-500/30'}`}>
                    {ev.restricted ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    {ev.restricted ? 'Restrito' : 'Público'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mb-3 line-clamp-2">{ev.description}</p>
                <div className="flex flex-col gap-1 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-400" />
                    {new Date(ev.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' · '}
                    {new Date(ev.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-purple-400" />
                    {ev.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    {ev.region}
                  </div>
                </div>

                {confirmDelete === ev._id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(ev._id)}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg transition-colors"
                    >
                      Confirmar exclusão
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(ev)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(ev._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs rounded-lg border border-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default withAuth(AdminEventsPage);