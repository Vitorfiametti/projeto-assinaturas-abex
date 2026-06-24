// src/components/admin/PaymentsDashboard.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Search
} from 'lucide-react';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  amount: number;
  method: string;
  status: 'approved' | 'pending' | 'failed' | 'cancelled';
  date: string;
  transactionId: string;
}

const PaymentsDashboard = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [searchTerm, setSearchTerm] = useState('');

  // 🔥 BUSCAR DADOS DA API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/payments');

        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }

        const data = await response.json();
        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
        // Fallback para dados mock em caso de erro
        setPayments([
          {
            id: 'PAY-001',
            userId: 'user-123',
            userName: 'João Silva',
            userEmail: 'joao@email.com',
            planName: 'Premium',
            amount: 79.00,
            method: 'Cartão de Crédito',
            status: 'approved',
            date: new Date().toISOString(),
            transactionId: 'TXN-ABC123'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Status config
  const statusConfig = {
    approved: {
      label: 'Aprovado',
      color: 'text-green-700 bg-green-100',
      icon: CheckCircle
    },
    pending: {
      label: 'Pendente',
      color: 'text-yellow-700 bg-yellow-100',
      icon: Clock
    },
    failed: {
      label: 'Recusado',
      color: 'text-red-700 bg-red-100',
      icon: XCircle
    },
    cancelled: {
      label: 'Cancelado',
      color: 'text-gray-600 bg-gray-100',
      icon: AlertCircle
    }
  };

  // Filtrar e ordenar pagamentos
  const filteredPayments = useMemo(() => {
    let result = [...payments];

    if (searchTerm) {
      result = result.filter(p =>
        p.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(p => p.status === filterStatus);
    }

    if (filterMethod !== 'all') {
      result = result.filter(p => p.method === filterMethod);
    }

    result.sort((a, b) => {
      switch(sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return result;
  }, [payments, filterStatus, filterMethod, sortBy, searchTerm]);

  // Cálculos de estatísticas
  const stats = useMemo(() => {
    const total = payments.reduce((acc, p) => acc + p.amount, 0);
    const approved = payments.filter(p => p.status === 'approved');
    const approvedTotal = approved.reduce((acc, p) => acc + p.amount, 0);
    const pending = payments.filter(p => p.status === 'pending').length;

    return {
      total: total.toFixed(2),
      approvedTotal: approvedTotal.toFixed(2),
      transactionsCount: payments.length,
      approvedCount: approved.length,
      pendingCount: pending,
      avgTicket: (total / payments.length || 0).toFixed(2)
    };
  }, [payments]);

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Gráfico - dados dos últimos 7 dias
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayPayments = payments.filter(p =>
        p.date.startsWith(dateStr) && p.status === 'approved'
      );
      const total = dayPayments.reduce((acc, p) => acc + p.amount, 0);

      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        value: total
      };
    });
  }, [payments]);

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '4px solid #e8192c',
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: 24 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Dashboard de Pagamentos
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Gerencie e acompanhe todas as transações da plataforma
            </p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', backgroundColor: '#e8192c', color: '#ffffff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            <Download style={{ width: 16, height: 16 }} />
            Exportar
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
          {/* Receita Total */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, backgroundColor: '#10b981', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign style={{ width: 24, height: 24, color: '#ffffff' }} />
              </div>
              <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>+12.5%</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Receita Total</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>R$ {stats.approvedTotal}</p>
          </div>

          {/* Transações */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, backgroundColor: '#3b82f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard style={{ width: 24, height: 24, color: '#ffffff' }} />
              </div>
              <span style={{ color: '#3b82f6', fontSize: 13, fontWeight: 600 }}>{stats.approvedCount}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Transações Aprovadas</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{stats.transactionsCount}</p>
          </div>

          {/* Ticket Médio */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, backgroundColor: '#00c9b1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp style={{ width: 24, height: 24, color: '#ffffff' }} />
              </div>
              <span style={{ color: '#00c9b1', fontSize: 13, fontWeight: 600 }}>R$ {stats.avgTicket}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Ticket Médio</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>R$ {stats.avgTicket}</p>
          </div>

          {/* Pendentes */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, backgroundColor: '#f97316', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock style={{ width: 24, height: 24, color: '#ffffff' }} />
              </div>
              <span style={{ color: '#f97316', fontSize: 13, fontWeight: 600 }}>{stats.pendingCount}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Pendentes</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{stats.pendingCount}</p>
          </div>
        </div>

        {/* Gráfico de Receita */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                Receita dos Últimos 7 Dias
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Acompanhe a evolução diária das suas receitas
              </p>
            </div>
            <Calendar style={{ width: 20, height: 20, color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, height: 192 }}>
            {chartData.map((item, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', width: '100%', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px 4px 0 0', overflow: 'hidden' }} className="group">
                  <div
                    style={{
                      backgroundColor: '#e8192c',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease',
                      height: `${(item.value / maxValue) * 180}px`,
                      minHeight: 20,
                      position: 'relative'
                    }}
                  >
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8, opacity: 0 }} className="group-hover:opacity-100" >
                      <span style={{ color: 'var(--text)', fontSize: 11, fontWeight: 700, backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
                        R$ {item.value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}>{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros e Busca */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: '1 1 200px', position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar por nome, email ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 8, paddingBottom: 8, backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '8px 16px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none' }}
            >
              <option value="all">Todos os Status</option>
              <option value="approved">Aprovado</option>
              <option value="pending">Pendente</option>
              <option value="failed">Recusado</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              style={{ padding: '8px 16px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none' }}
            >
              <option value="all">Todos os Métodos</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="PIX">PIX</option>
              <option value="Boleto">Boleto</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '8px 16px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none' }}
            >
              <option value="date-desc">Data (Mais Recente)</option>
              <option value="date-asc">Data (Mais Antigo)</option>
              <option value="amount-desc">Valor (Maior)</option>
              <option value="amount-asc">Valor (Menor)</option>
            </select>
          </div>
        </div>

        {/* Tabela de Pagamentos */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <tr>
                  {['ID / Usuário', 'Plano', 'Valor', 'Método', 'Status', 'Data', 'Ações'].map(col => (
                    <th key={col} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <AlertCircle style={{ width: 48, height: 48, color: 'var(--border)' }} />
                        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                          Nenhuma transação encontrada
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                          Tente ajustar os filtros de busca
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment, i) => {
                    const StatusIcon = statusConfig[payment.status].icon;
                    return (
                      <tr
                        key={payment.id}
                        style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined, cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{payment.id}</p>
                          <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{payment.userName}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{payment.userEmail}</p>
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{payment.planName}</span>
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>R$ {payment.amount.toFixed(2)}</span>
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{payment.method}</span>
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[payment.status].color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig[payment.status].label}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--text-muted)' }}>
                          {formatDate(payment.date)}
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPayment(payment);
                            }}
                            style={{ color: '#e8192c', fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Detalhes */}
        {selectedPayment && (
          <div
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}
            onClick={() => setSelectedPayment(null)}
          >
            <div
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, maxWidth: 640, width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                  Detalhes da Transação
                </h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <XCircle style={{ width: 24, height: 24 }} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>ID da Transação</p>
                    <p style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{selectedPayment.id}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>ID Externo</p>
                    <p style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{selectedPayment.transactionId}</p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                  <h4 style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 16 }}>Informações do Cliente</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Nome</p>
                      <p style={{ color: 'var(--text)' }}>{selectedPayment.userName}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Email</p>
                      <p style={{ color: 'var(--text)' }}>{selectedPayment.userEmail}</p>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                  <h4 style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 16 }}>Detalhes do Pagamento</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Plano</p>
                      <p style={{ color: 'var(--text)', fontWeight: 500 }}>{selectedPayment.planName}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Valor</p>
                      <p style={{ color: '#10b981', fontWeight: 700, fontSize: 18 }}>
                        R$ {selectedPayment.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Método de Pagamento</p>
                      <p style={{ color: 'var(--text)' }}>{selectedPayment.method}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Status</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedPayment.status].color}`}>
                        {React.createElement(statusConfig[selectedPayment.status].icon, { className: 'w-4 h-4' })}
                        {statusConfig[selectedPayment.status].label}
                      </span>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Data</p>
                      <p style={{ color: 'var(--text)' }}>{formatDate(selectedPayment.date)}</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, paddingTop: 8 }}>
                  <button style={{ flex: 1, padding: '12px 24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: 14 }}>
                    Reembolsar
                  </button>
                  <button style={{ flex: 1, padding: '12px 24px', backgroundColor: '#e8192c', border: 'none', color: '#ffffff', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                    Baixar Comprovante
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsDashboard;
