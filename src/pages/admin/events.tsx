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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div
          className="animate-spin"
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '9999px',
            border: '2px solid var(--accent)',
            borderTopColor: 'transparent',
          }}
        />
      </div>
    </Layout>
  );

  return (
    <Layout activeTab="admin-events">
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1rem', background: 'var(--bg)', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CalendarDays style={{ width: '1.25rem', height: '1.25rem', color: '#ffffff' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text)',
                letterSpacing: '0.05em',
              }}>
                Gerenciar Eventos
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {events.length} evento{events.length !== 1 ? 's' : ''} cadastrado{events.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'var(--accent)',
              color: '#ffffff',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus style={{ width: '1rem', height: '1rem' }} />
            Novo Evento
          </button>
        </div>

        {/* Alertas */}
        {error && (
          <div style={{
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent)',
            borderRadius: '0.75rem',
            padding: '1rem',
          }}>
            <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent)', flexShrink: 0 }} />
            <p style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}
        {success && (
          <div style={{
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--teal-subtle)',
            border: '1px solid var(--teal)',
            borderRadius: '0.75rem',
            padding: '1rem',
          }}>
            <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--teal)', flexShrink: 0 }} />
            <p style={{ color: 'var(--teal)', fontSize: '0.875rem' }}>{success}</p>
          </div>
        )}

        {/* Filtros */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            padding: '0.5rem 0.75rem',
            flex: 1,
            minWidth: '12rem',
          }}>
            <Search style={{ width: '1rem', height: '1rem', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar evento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text)',
                fontSize: '0.875rem',
                border: 'none',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter style={{ width: '1rem', height: '1rem', color: 'var(--text-muted)' }} />
            <select
              value={filterRegion}
              onChange={e => setFilterRegion(e.target.value)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: '0.875rem',
                borderRadius: '0.75rem',
                padding: '0.5rem 0.75rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">Todas as regiões</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Formulário */}
        {showForm && (
          <div style={{
            marginBottom: '1.5rem',
            background: 'var(--bg-card)',
            border: '2px solid var(--accent)',
            borderRadius: '1rem',
            padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)' }}>
                {editingId ? 'Editar Evento' : 'Novo Evento'}
              </h2>
              <button
                onClick={closeForm}
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '0.5rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <X style={{ width: '1rem', height: '1rem', color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Festa de Inauguração"
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    borderRadius: '0.75rem',
                    padding: '0.625rem 1rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Descrição *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descreva o evento..."
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    borderRadius: '0.75rem',
                    padding: '0.625rem 1rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Data e Hora *</label>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    borderRadius: '0.75rem',
                    padding: '0.625rem 1rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Região *</label>
                <input
                  type="text"
                  value={form.region}
                  onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                  placeholder="Ex: Sul, Sudeste, Nordeste..."
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    borderRadius: '0.75rem',
                    padding: '0.625rem 1rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Local *</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Ex: Ginásio Central, Auditório Bloco A..."
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    borderRadius: '0.75rem',
                    padding: '0.625rem 1rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <div
                    onClick={() => setForm(f => ({ ...f, restricted: !f.restricted }))}
                    style={{
                      width: '2.75rem',
                      height: '1.5rem',
                      borderRadius: '9999px',
                      background: form.restricted ? 'var(--accent)' : 'var(--border)',
                      position: 'relative',
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '0.25rem',
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '9999px',
                      background: '#ffffff',
                      transition: 'transform 0.2s',
                      transform: form.restricted ? 'translateX(1.5rem)' : 'translateX(0.25rem)',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>Evento restrito a assinantes</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={closeForm}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1.25rem',
                  background: 'var(--accent)',
                  color: '#ffffff',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <Save style={{ width: '1rem', height: '1rem' }} />
                {saving ? 'Salvando...' : 'Salvar Evento'}
              </button>
            </div>
          </div>
        )}

        {/* Lista de eventos */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '12rem' }}>
            <div
              className="animate-spin"
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '9999px',
                border: '2px solid var(--accent)',
                borderTopColor: 'transparent',
              }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '4rem 0', textAlign: 'center' }}>
            <CalendarDays style={{ width: '3rem', height: '3rem', color: 'var(--border)' }} />
            <p style={{ color: 'var(--text-muted)' }}>Nenhum evento encontrado.</p>
            <button
              onClick={openCreate}
              style={{
                color: 'var(--accent)',
                fontSize: '0.875rem',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Criar primeiro evento
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filtered.map(ev => (
              <div
                key={ev._id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--teal)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3 }}>{ev.title}</h3>
                  <span style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    borderRadius: '9999px',
                    padding: '0.125rem 0.5rem',
                    border: `1px solid ${ev.restricted ? 'var(--accent)' : 'var(--teal)'}`,
                    background: ev.restricted ? 'var(--accent-subtle)' : 'var(--teal-subtle)',
                    color: ev.restricted ? 'var(--accent)' : 'var(--teal)',
                  }}>
                    {ev.restricted ? <Lock style={{ width: '0.75rem', height: '0.75rem' }} /> : <Globe style={{ width: '0.75rem', height: '0.75rem' }} />}
                    {ev.restricted ? 'Restrito' : 'Público'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock style={{ width: '0.75rem', height: '0.75rem', color: 'var(--accent)' }} />
                    {new Date(ev.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' · '}
                    {new Date(ev.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin style={{ width: '0.75rem', height: '0.75rem', color: 'var(--accent)' }} />
                    {ev.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Filter style={{ width: '0.75rem', height: '0.75rem', color: 'var(--text-muted)' }} />
                    {ev.region}
                  </div>
                </div>

                {confirmDelete === ev._id ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleDelete(ev._id)}
                      style={{
                        flex: 1,
                        padding: '0.375rem 0',
                        background: 'var(--accent)',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      Confirmar exclusão
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      style={{
                        flex: 1,
                        padding: '0.375rem 0',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => openEdit(ev)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        padding: '0.375rem 0',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text)',
                        fontSize: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      <Edit3 style={{ width: '0.75rem', height: '0.75rem' }} />
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(ev._id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        padding: '0.375rem 0',
                        background: 'var(--accent-subtle)',
                        color: 'var(--accent)',
                        fontSize: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--accent)',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <Trash2 style={{ width: '0.75rem', height: '0.75rem' }} />
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
