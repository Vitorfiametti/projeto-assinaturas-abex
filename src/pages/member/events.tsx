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
      cells.push(<div key={`empty-${i}`} className="h-14 sm:h-16" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = eventsOnDay(day);
      const isToday =
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();
      const isSelected = selectedDay === day;

      cells.push(
        <button
          key={day}
          onClick={() => setSelectedDay(isSelected ? null : day)}
          className={`
            h-14 sm:h-16 rounded-xl flex flex-col items-center justify-start pt-1 gap-1 transition-all duration-200 border
            ${isSelected
              ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/30'
              : isToday
              ? 'bg-slate-700 border-purple-500/50'
              : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/70 hover:border-purple-500/30'}
          `}
        >
          <span className={`text-sm font-semibold ${isSelected ? 'text-white' : isToday ? 'text-purple-300' : 'text-slate-300'}`}>
            {day}
          </span>
          {dayEvents.length > 0 && (
            <div className="flex gap-0.5">
              {dayEvents.slice(0, 3).map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-400'}`} />
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeTab="events">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Calendário de Eventos
            </h1>
          </div>
          <p className="text-slate-400 text-sm ml-13">
            Encontre eventos por região e data
          </p>
        </div>

        {/* Filtro de região */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Filter className="w-4 h-4" />
            <span>Região:</span>
          </div>
          <button
            onClick={() => setSelectedRegion('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedRegion === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            Todas
          </button>
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedRegion === r
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Calendário */}
          <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 sm:p-6">
            {/* Navegação do mês */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-300" />
              </button>
              <h2 className="text-lg font-semibold text-white">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* Cabeçalho dias da semana */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS_OF_WEEK.map(d => (
                <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid de dias */}
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            )}
          </div>

          {/* Painel lateral */}
          <div className="flex flex-col gap-4">

            {/* Resumo do mês */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-400" />
                Este mês
              </h3>
              {loading ? (
                <div className="text-slate-500 text-sm">Carregando...</div>
              ) : events.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <AlertCircle className="w-8 h-8 text-slate-600" />
                  <p className="text-slate-400 text-sm">
                    {selectedRegion !== 'all'
                      ? `Nenhum evento encontrado em "${selectedRegion}" neste mês.`
                      : 'Nenhum evento neste mês.'}
                  </p>
                  {selectedRegion !== 'all' && (
                    <button
                      onClick={() => setSelectedRegion('all')}
                      className="text-purple-400 text-xs hover:text-purple-300 underline"
                    >
                      Ver todas as regiões
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-purple-300 font-semibold text-lg">
                  {events.length} evento{events.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Eventos do dia selecionado */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 flex-1">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                {selectedDay !== null
                  ? `${selectedDay} de ${MONTHS[currentMonth]}`
                  : 'Selecione um dia'}
              </h3>

              {selectedDay === null ? (
                <p className="text-slate-500 text-sm text-center py-6">
                  Clique em um dia no calendário para ver os eventos
                </p>
              ) : selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <Calendar className="w-8 h-8 text-slate-600" />
                  <p className="text-slate-400 text-sm">Nenhum evento neste dia.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedDayEvents.map(event => (
                    <div
                      key={event._id}
                      className="bg-slate-700/50 rounded-xl p-3 border border-slate-600/50 hover:border-purple-500/40 transition-colors"
                    >
                      <h4 className="text-white font-medium text-sm mb-1">{event.title}</h4>
                      <p className="text-slate-400 text-xs mb-2 line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3 text-purple-400" />
                        <span>{event.location}</span>
                        <span className="mx-1">·</span>
                        <span className="text-purple-400">{event.region}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <Clock className="w-3 h-3" />
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

        {/* Lista de todos os eventos do mês */}
        {!loading && events.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              Todos os eventos — {MONTHS[currentMonth]} {currentYear}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map(event => (
                <div
                  key={event._id}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 hover:border-purple-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-white font-semibold text-sm">{event.title}</h4>
                    <span className="text-xs bg-purple-900/40 text-purple-300 border border-purple-500/30 rounded-full px-2 py-0.5 whitespace-nowrap">
                      {event.region}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mb-3 line-clamp-2">{event.description}</p>
                  <div className="flex flex-col gap-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      <span>
                        {new Date(event.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(event.date).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-purple-400" />
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
          <div className="mt-6 flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default withAuth(EventsPage);