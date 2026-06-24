"use client";
// src/pages/member/events.tsx
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Filter,
  AlertCircle,
  Clock,
  Search,
} from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  region: string;
  restricted: boolean;
  imageUrl?: string;
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function EventsPage() {
  const { status } = useSession();
  const router = useRouter();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        month: String(currentMonth + 1),
        year: String(currentYear),
        ...(selectedRegion !== 'all' && { region: selectedRegion }),
      });
      const res = await fetch(`/api/member/events?${params}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setEvents(data.data);
      setRegions(data.regions || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar eventos.');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear, selectedRegion]);

  useEffect(() => {
    if (status === 'authenticated') fetchEvents();
  }, [status, fetchEvents]);

  // --- Helpers de calendário ---
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const eventsOnDay = (day: number) =>
    events.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

  const selectedDayEvents = selectedDay !== null ? eventsOnDay(selectedDay) : [];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const cells: JSX.Element[] = [];

    // Células vazias antes do dia 1
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} style={{ height: '3.5rem' }} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = eventsOnDay(day);
      const isToday =
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();
      const isSelected = selectedDay === day;

      let cellStyle: React.CSSProperties = {
        height: '3.5rem',
        borderRadius: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '0.25rem',
        gap: '0.25rem',
        transition: 'all 0.2s',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        background: 'var(--bg-secondary)',
      };

      if (isSelected) {
        cellStyle = {
          ...cellStyle,
          background: 'var(--teal)',
          border: '1px solid var(--teal)',
        };
      } else if (isToday) {
        cellStyle = {
          ...cellStyle,
          background: 'var(--bg-secondary)',
          border: '2px solid var(--teal)',
        };
      }

      const dayNumStyle: React.CSSProperties = {
        fontSize: '0.875rem',
        fontWeight: 600,
        color: isSelected ? '#ffffff' : isToday ? 'var(--teal)' : 'var(--text)',
      };

      cells.push(
        <button
          key={day}
          onClick={() => setSelectedDay(isSelected ? null : day)}
          style={cellStyle}
        >
          <span style={dayNumStyle}>{day}</span>
          {dayEvents.length > 0 && (
            <div style={{ display: 'flex', gap: '0.125rem' }}>
              {dayEvents.slice(0, 3).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: '0.375rem',
                    height: '0.375rem',
                    borderRadius: '9999px',
                    background: isSelected ? '#ffffff' : 'var(--accent)',
                  }}
                />
              ))}
            </div>
          )}
        </button>
      );
    }

    return cells;
  };

  if (status === 'loading') {
    return (
      <Layout activeTab="events">
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
  }

  return (
    <Layout activeTab="events">
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1rem', background: 'var(--bg)', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#ffffff' }} />
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text)',
              letterSpacing: '0.05em',
            }}>
              Eventos
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginLeft: '3.25rem' }}>
            Encontre eventos por região e data
          </p>
        </div>

        {/* Filtro de região */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <Filter style={{ width: '1rem', height: '1rem' }} />
            <span>Região:</span>
          </div>
          <button
            onClick={() => setSelectedRegion('all')}
            style={{
              padding: '0.375rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s',
              cursor: 'pointer',
              border: selectedRegion === 'all' ? 'none' : '1px solid var(--border)',
              background: selectedRegion === 'all' ? 'var(--accent)' : 'var(--bg-card)',
              color: selectedRegion === 'all' ? '#ffffff' : 'var(--text-muted)',
            }}
          >
            Todas
          </button>
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              style={{
                padding: '0.375rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                cursor: 'pointer',
                border: selectedRegion === r ? 'none' : '1px solid var(--border)',
                background: selectedRegion === r ? 'var(--accent)' : 'var(--bg-card)',
                color: selectedRegion === r ? '#ffffff' : 'var(--text-muted)',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="lg:grid-cols-3-custom">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <div style={{ display: 'contents' }}>
              {/* Calendário + Painel lateral wrapper */}
              <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)' }} className="calendar-grid">

                    {/* Calendário */}
                    <div style={{
                      background: 'var(--bg-card)',
                      borderRadius: '1rem',
                      border: '1px solid var(--border)',
                      padding: '1.5rem',
                    }}>
                      {/* Navegação do mês */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <button
                          onClick={prevMonth}
                          style={{
                            width: '2.25rem',
                            height: '2.25rem',
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
                          <ChevronLeft style={{ width: '1.25rem', height: '1.25rem', color: 'var(--text)' }} />
                        </button>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)' }}>
                          {MONTHS[currentMonth]} {currentYear}
                        </h2>
                        <button
                          onClick={nextMonth}
                          style={{
                            width: '2.25rem',
                            height: '2.25rem',
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
                          <ChevronRight style={{ width: '1.25rem', height: '1.25rem', color: 'var(--text)' }} />
                        </button>
                      </div>

                      {/* Cabeçalho dias da semana */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem' }}>
                        {DAYS_OF_WEEK.map(d => (
                          <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', padding: '0.25rem 0' }}>
                            {d}
                          </div>
                        ))}
                      </div>

                      {/* Grid de dias */}
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
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                          {renderCalendar()}
                        </div>
                      )}
                    </div>

                    {/* Painel lateral */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                      {/* Resumo do mês */}
                      <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: '1rem',
                        border: '1px solid var(--border)',
                        padding: '1rem',
                      }}>
                        <h3 style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--text)',
                          marginBottom: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}>
                          <Search style={{ width: '1rem', height: '1rem', color: 'var(--accent)' }} />
                          Este mês
                        </h3>
                        {loading ? (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Carregando...</div>
                        ) : events.length === 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem 0', textAlign: 'center' }}>
                            <AlertCircle style={{ width: '2rem', height: '2rem', color: 'var(--border)' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                              {selectedRegion !== 'all'
                                ? `Nenhum evento encontrado em "${selectedRegion}" neste mês.`
                                : 'Nenhum evento neste mês.'}
                            </p>
                            {selectedRegion !== 'all' && (
                              <button
                                onClick={() => setSelectedRegion('all')}
                                style={{
                                  color: 'var(--accent)',
                                  fontSize: '0.75rem',
                                  textDecoration: 'underline',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                Ver todas as regiões
                              </button>
                            )}
                          </div>
                        ) : (
                          <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '1.125rem' }}>
                            {events.length} evento{events.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      {/* Eventos do dia selecionado */}
                      <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: '1rem',
                        border: '1px solid var(--border)',
                        padding: '1rem',
                        flex: 1,
                      }}>
                        <h3 style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--text)',
                          marginBottom: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}>
                          <Clock style={{ width: '1rem', height: '1rem', color: 'var(--accent)' }} />
                          {selectedDay !== null
                            ? `${selectedDay} de ${MONTHS[currentMonth]}`
                            : 'Selecione um dia'}
                        </h3>

                        {selectedDay === null ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
                            Clique em um dia no calendário para ver os eventos
                          </p>
                        ) : selectedDayEvents.length === 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem 0', textAlign: 'center' }}>
                            <Calendar style={{ width: '2rem', height: '2rem', color: 'var(--border)' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhum evento neste dia.</p>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {selectedDayEvents.map(event => (
                              <div
                                key={event._id}
                                style={{
                                  background: 'var(--bg-secondary)',
                                  borderRadius: '0.75rem',
                                  padding: '0.75rem',
                                  border: '1px solid var(--border)',
                                  transition: 'border-color 0.2s',
                                }}
                              >
                                <h4 style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{event.title}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{event.description}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  <MapPin style={{ width: '0.75rem', height: '0.75rem', color: 'var(--accent)' }} />
                                  <span>{event.location}</span>
                                  <span style={{ margin: '0 0.25rem' }}>·</span>
                                  <span style={{ color: 'var(--teal)' }}>{event.region}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                  <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
                                  <span>
                                    {new Date(event.date).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Lista de todos os eventos do mês */}
        {!loading && events.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Todos os eventos — {MONTHS[currentMonth]} {currentYear}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {events.map(event => (
                <div
                  key={event._id}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '1rem',
                    border: '1px solid var(--border)',
                    padding: '1rem',
                    transition: 'border-color 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--teal)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem' }}>{event.title}</h4>
                    <span style={{
                      fontSize: '0.75rem',
                      background: 'var(--teal-subtle)',
                      color: 'var(--teal)',
                      border: '1px solid var(--teal)',
                      borderRadius: '9999px',
                      padding: '0.125rem 0.5rem',
                      whiteSpace: 'nowrap',
                    }}>
                      {event.region}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{event.description}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar style={{ width: '0.75rem', height: '0.75rem', color: 'var(--accent)' }} />
                      <span>
                        {new Date(event.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
                      <span>
                        {new Date(event.date).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin style={{ width: '0.75rem', height: '0.75rem', color: 'var(--accent)' }} />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div style={{
            marginTop: '1.5rem',
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
      </div>
    </Layout>
  );
}

export default withAuth(EventsPage);
