// src/pages/admin/dashboard.tsx - Com gráficos implementados
'use client'
import Layout from '@/components/Layout';
import withAuth from '@/components/withAuth';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Users,
  Crown,
  FileText,
  Shield,
  TrendingUp,
  TrendingDown,
  Eye,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  DollarSign,
  UserCheck,
  Lock,
  Zap,
  Clock,
  Target,
  Award,
  RefreshCw,
  Filter,
  Download,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface DashboardData {
  totalUsers: number;
  activeSubscriptions: number;
  totalPlans: number;
  totalContent: number;
  restrictedContent: number;
  monthlyGrowth?: {
    users: number;
    subscriptions: number;
    content: number;
  };
  revenueData?: {
    total: number;
    monthly: number;
    growth: number;
  };
}

function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  // Gerar dados históricos baseados nos dados atuais
  const generateChartData = () => {
    if (!data) return { revenueData: [], userGrowthData: [], conversionData: [] };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentUsers = data.totalUsers;
    const currentRevenue = data.revenueData?.monthly || 0;
    const currentSubs = data.activeSubscriptions;

    // Simular crescimento histórico
    const revenueData = months.map((month, index) => {
      const factor = (index + 1) / 6; // Crescimento gradual
      return {
        month,
        revenue: Math.round(currentRevenue * factor * 100) / 100,
        subscriptions: Math.round(currentSubs * factor),
        users: Math.round(currentUsers * factor)
      };
    });

    const userGrowthData = months.map((month, index) => {
      const factor = (index + 1) / 6;
      return {
        month,
        users: Math.round(currentUsers * factor),
        newUsers: Math.round((currentUsers * factor) - (currentUsers * (factor - 0.1))),
        activeUsers: Math.round(currentUsers * factor * 0.8)
      };
    });

    // Dados para gráfico de conversão
    const conversionData = [
      { name: 'Visitantes', value: data.totalUsers + 50, color: '#e8192c' },
      { name: 'Usuários', value: data.totalUsers, color: '#00c9b1' },
      { name: 'Premium', value: data.activeSubscriptions, color: '#10b981' },
    ];

    return { revenueData, userGrowthData, conversionData };
  };

  const { revenueData, userGrowthData, conversionData } = generateChartData();

  const fetchDashboardData = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/reports?period=${timeFilter}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Response is not JSON:', text);
        throw new Error('Server returned non-JSON response');
      }

      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Unknown error occurred');
      }
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);

      if (err.name === 'SyntaxError') {
        setError('Invalid server response format. Please check the API endpoint.');
      } else if (err.message.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'Error loading dashboard data.');
      }

      setData({
        totalUsers: 0,
        activeSubscriptions: 0,
        totalPlans: 0,
        totalContent: 0,
        restrictedContent: 0,
        monthlyGrowth: {
          users: 0,
          subscriptions: 0,
          content: 0
        },
        revenueData: {
          total: 0,
          monthly: 0,
          growth: 0
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    iconBg,
    subtitle
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    iconBg: string;
    subtitle?: string;
  }) => (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '24px',
      transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          padding: '12px',
          borderRadius: '12px',
          backgroundColor: iconBg,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon style={{ width: '24px', height: '24px', color: '#ffffff' }} />
        </div>
        {trend && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 500,
            backgroundColor: trend === 'up' ? '#d1fae5' : trend === 'down' ? '#fee2e2' : '#f3f4f6',
            color: trend === 'up' ? '#059669' : trend === 'down' ? '#dc2626' : '#6b7280',
          }}>
            {trend === 'up' ? <TrendingUp style={{ width: '12px', height: '12px' }} /> :
             trend === 'down' ? <TrendingDown style={{ width: '12px', height: '12px' }} /> :
             <Activity style={{ width: '12px', height: '12px' }} />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <h3 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{value}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>{title}</p>
        {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{subtitle}</p>}
      </div>
    </div>
  );

  const QuickAction = ({ icon: Icon, label, onClick, bgColor }: {
    icon: any;
    label: string;
    onClick: () => void;
    bgColor: string;
  }) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: bgColor,
        color: '#ffffff',
        fontWeight: 500,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s',
        width: '100%',
      }}
    >
      <Icon style={{ width: '20px', height: '20px' }} />
      {label}
    </button>
  );

  if (loading) {
    return (
      <Layout activeTab='dashboard'>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid var(--accent)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Loading Dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !data) {
    return (
      <Layout activeTab='dashboard'>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
          <div style={{
            textAlign: 'center',
            backgroundColor: 'var(--accent-subtle)',
            border: '1px solid var(--accent)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '448px',
          }}>
            <AlertCircle style={{ width: '64px', height: '64px', color: 'var(--accent)', margin: '0 auto 16px' }} />
            <h2 style={{ color: 'var(--accent)', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Error loading data</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => fetchDashboardData()}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                  padding: '8px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text)',
                  padding: '8px 24px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeTab='dashboard'>
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Error Alert */}
          {error && data && (
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #f59e0b',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <AlertCircle style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
              <div>
                <p style={{ color: '#92400e', fontWeight: 500 }}>Warning</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                style={{
                  marginLeft: 'auto',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Dashboard
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>Platform overview and real-time metrics</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  outline: 'none',
                }}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  opacity: refreshing ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RefreshCw style={{ width: '20px', height: '20px', animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              </button>

              <button style={{
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Download style={{ width: '16px', height: '16px' }} />
                Export
              </button>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            <StatCard
              title="Total Users"
              value={data?.totalUsers || 0}
              icon={Users}
              trend="up"
              trendValue={`+${data?.monthlyGrowth?.users || 0}%`}
              iconBg="#e8192c"
              subtitle="Monthly growth"
            />

            <StatCard
              title="Active Subscriptions"
              value={data?.activeSubscriptions || 0}
              icon={Crown}
              trend="up"
              trendValue={`+${data?.monthlyGrowth?.subscriptions || 0}%`}
              iconBg="#00c9b1"
              subtitle="Premium members"
            />

            <StatCard
              title="Active Plans"
              value={data?.totalPlans || 0}
              icon={Target}
              trend="neutral"
              trendValue="stable"
              iconBg="#10b981"
              subtitle="Available offers"
            />

            <StatCard
              title="Total Content"
              value={data?.totalContent || 0}
              icon={FileText}
              trend="up"
              trendValue={`+${data?.monthlyGrowth?.content || 0}%`}
              iconBg="#f97316"
              subtitle="Published materials"
            />
          </div>

          {/* Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Revenue Chart */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>Revenue Analytics</h2>
                <BarChart3 style={{ width: '24px', height: '24px', color: 'var(--accent)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <DollarSign style={{ width: '20px', height: '20px', color: '#10b981' }} />
                    <span style={{ color: '#10b981', fontWeight: 500 }}>Monthly Revenue</span>
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
                    ${(data?.revenueData?.monthly || 0).toLocaleString()}
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    +{data?.revenueData?.growth || 0}% vs last month
                  </p>
                </div>

                <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <UserCheck style={{ width: '20px', height: '20px', color: 'var(--teal)' }} />
                    <span style={{ color: 'var(--teal)', fontWeight: 500 }}>Conversion Rate</span>
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
                    {((data?.activeSubscriptions || 0) / (data?.totalUsers || 1) * 100).toFixed(1)}%
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Users to premium</p>
                </div>
              </div>

              {/* Revenue Line Chart */}
              <div style={{ height: '256px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0ddd8" />
                    <XAxis dataKey="month" stroke="#666666" />
                    <YAxis stroke="#666666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e0ddd8',
                        borderRadius: '8px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#e8192c"
                      strokeWidth={3}
                      dot={{ fill: '#e8192c', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Conversion Funnel */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChartIcon style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
                Conversion Funnel
              </h2>

              <div style={{ height: '256px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={conversionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {conversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e0ddd8',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                {conversionData.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}
                      ></div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{item.name}</span>
                    </div>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Growth Chart */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>User Growth Analytics</h2>
              <Users style={{ width: '24px', height: '24px', color: 'var(--teal)' }} />
            </div>

            <div style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e8192c" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#e8192c" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00c9b1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00c9b1" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0ddd8" />
                  <XAxis dataKey="month" stroke="#666666" />
                  <YAxis stroke="#666666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e0ddd8',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stackId="1"
                    stroke="#e8192c"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    name="Total Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="activeUsers"
                    stackId="2"
                    stroke="#00c9b1"
                    fillOpacity={1}
                    fill="url(#colorActive)"
                    name="Active Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions & Additional Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
                Quick Actions
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <QuickAction
                  icon={Users}
                  label="Manage Users"
                  onClick={() => {}}
                  bgColor="#e8192c"
                />
                <QuickAction
                  icon={Crown}
                  label="Create Plan"
                  onClick={() => {}}
                  bgColor="#00c9b1"
                />
                <QuickAction
                  icon={FileText}
                  label="New Content"
                  onClick={() => {}}
                  bgColor="#10b981"
                />
                <QuickAction
                  icon={Shield}
                  label="Settings"
                  onClick={() => {}}
                  bgColor="#f97316"
                />
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'var(--accent)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Lock style={{ width: '24px', height: '24px', color: '#ffffff' }} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{data?.restrictedContent || 0}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Restricted Content</p>
              <p style={{ color: 'var(--accent)', fontSize: '12px', marginTop: '8px' }}>Premium members only</p>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'var(--teal)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Activity style={{ width: '24px', height: '24px', color: '#ffffff' }} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                {Math.round(((data?.activeSubscriptions || 0) / (data?.totalUsers || 1)) * 100)}%
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Engagement Rate</p>
              <p style={{ color: 'var(--teal)', fontSize: '12px', marginTop: '8px' }}>Active users today</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(AdminDashboardPage, { requiresAdmin: true });
