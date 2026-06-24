'use client'
// src/pages/admin/content.tsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import {
  FileText,
  Video,
  Calendar,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Upload,
  Link,
  Crown,
  Users,
  Zap,
  Play,
  BookOpen,
  Image as ImageIcon,
  Music,
  FileVideo,
  Headphones,
  Monitor,
  Smartphone,
  Archive,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Settings,
  Tag,
  Clock,
  TrendingUp
} from 'lucide-react';

interface Content {
  _id: string;
  title: string;
  description: string;
  publishDate: string;
  type: string;
  url?: string;
  restricted: boolean;
  planId?: string;
  plan?: { _id: string; name: string };
  active?: boolean;
  views?: number;
  engagement?: number;
  thumbnail?: string;
}

interface Plan {
  _id: string;
  name: string;
}

const contentTypes = [
  { value: 'Article', label: 'Article', icon: FileText, color: '#e8192c' },
  { value: 'Video', label: 'Video', icon: Video, color: '#e8192c' },
  { value: 'Event', label: 'Event', icon: Calendar, color: '#00c9b1' },
  { value: 'Podcast', label: 'Podcast', icon: Headphones, color: '#10b981' },
  { value: 'Course', label: 'Course', icon: BookOpen, color: '#f97316' },
  { value: 'Webinar', label: 'Webinar', icon: Monitor, color: '#00c9b1' },
  { value: 'Other', label: 'Other', icon: Archive, color: '#6b7280' },
];

function ManageContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState<Content[]>([]);
  const [filteredContents, setFilteredContents] = useState<Content[]>([]);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRestricted, setFilterRestricted] = useState('');

  const [form, setForm] = useState<Partial<Content>>({
    title: '',
    description: '',
    type: 'Article',
    url: '',
    restricted: true,
    planId: '',
    active: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  useEffect(() => {
    filterContent();
  }, [contents, searchTerm, filterType, filterRestricted]);

  const filterContent = () => {
    let filtered = contents;

    if (searchTerm) {
      filtered = filtered.filter(content =>
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter(content => content.type === filterType);
    }

    if (filterRestricted !== '') {
      filtered = filtered.filter(content =>
        filterRestricted === 'true' ? content.restricted : !content.restricted
      );
    }

    setFilteredContents(filtered);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resContents, resPlans] = await Promise.all([
        fetch('/api/admin/content'),
        fetch('/api/admin/plans')
      ]);

      const [dataContents, dataPlans] = await Promise.all([
        resContents.json(),
        resPlans.json()
      ]);

      if (dataContents.success) {
        setContents(dataContents.data);
      } else {
        setError(dataContents.message);
      }

      if (dataPlans.success) {
        setAvailablePlans(dataPlans.data);
      } else {
        setError(dataPlans.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormLoading(true);

    const method = isEditing ? 'PUT' : 'POST';
    const url = '/api/admin/content';
    const body = isEditing ? { ...form, id: currentContentId } : form;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        resetForm();
        fetchData();
        setShowForm(false);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error saving content.');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      type: 'Article',
      url: '',
      restricted: true,
      planId: '',
      active: true,
    });
    setIsEditing(false);
    setCurrentContentId(null);
    setError(null);
  };

  const handleEdit = (content: Content) => {
    setForm({
      title: content.title,
      description: content.description,
      type: content.type,
      url: content.url,
      restricted: content.restricted,
      planId: content.planId || '',
      active: content.active !== false,
    });
    setIsEditing(true);
    setCurrentContentId(content._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/content?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting content.');
    }
  };

  const toggleContentStatus = async (id: string, active: boolean) => {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !active }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error updating status.');
    }
  };

  const getTypeConfig = (type: string) => {
    return contentTypes.find(t => t.value === type) || contentTypes[0];
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const ContentCard = ({ content }: { content: Content }) => {
    const typeConfig = getTypeConfig(content.type);
    const IconComponent = typeConfig.icon;

    return (
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: typeConfig.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <IconComponent style={{ width: '24px', height: '24px', color: '#ffffff' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Status Badge */}
            <button
              onClick={() => toggleContentStatus(content._id, content.active !== false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: content.active !== false ? 'var(--teal-subtle)' : 'var(--accent-subtle)',
                color: content.active !== false ? 'var(--teal)' : 'var(--accent)',
              }}
            >
              {content.active !== false ? <Eye style={{ width: '12px', height: '12px' }} /> : <EyeOff style={{ width: '12px', height: '12px' }} />}
              {content.active !== false ? 'Active' : 'Inactive'}
            </button>

            {/* Restricted Badge */}
            {content.restricted && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent)',
              }}>
                <Lock style={{ width: '12px', height: '12px' }} />
                Restricted
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{content.title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>{content.description}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Tag style={{ width: '12px', height: '12px' }} />
              {typeConfig.label}
            </span>
            {content.plan && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Crown style={{ width: '12px', height: '12px' }} />
                {content.plan.name}
              </span>
            )}
            {content.url && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Link style={{ width: '12px', height: '12px' }} />
                External URL
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
              <Eye style={{ width: '16px', height: '16px' }} />
              {content.views || 0}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
              <TrendingUp style={{ width: '16px', height: '16px' }} />
              {content.engagement || 0}%
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {new Date(content.publishDate).toLocaleDateString('en-US')}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEdit(content)}
            style={{
              flex: 1,
              backgroundColor: 'var(--teal-subtle)',
              color: 'var(--teal)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Edit3 style={{ width: '16px', height: '16px' }} />
            Edit
          </button>
          {content.url && (
            <button
              onClick={() => window.open(content.url, '_blank')}
              style={{
                backgroundColor: '#d1fae5',
                color: '#059669',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ExternalLink style={{ width: '16px', height: '16px' }} />
            </button>
          )}
          <button
            onClick={() => handleDelete(content._id, content.title)}
            style={{
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <Layout>
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
            <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Loading content...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout activeTab='admin-content'>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
          <div style={{ textAlign: 'center', backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent)', borderRadius: '16px', padding: '32px' }}>
            <AlertCircle style={{ width: '64px', height: '64px', color: 'var(--accent)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--accent)', fontSize: '18px' }}>Access denied. Please login as administrator.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeTab='admin-content'>
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Gerenciar Conteúdo
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>Create and manage your platform's exclusive content</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Download style={{ width: '16px', height: '16px' }} />
                Export
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Plus style={{ width: '20px', height: '20px' }} />
                New Content
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
              <p style={{ color: 'var(--accent)' }}>{error}</p>
              <button
                onClick={() => setError(null)}
                style={{ marginLeft: 'auto', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>{contents.length}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--teal)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
                    {contents.filter(c => c.active !== false).length}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Active</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
                    {contents.filter(c => c.restricted).length}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Restricted</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#f97316', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
                    {Math.round(contents.reduce((acc, c) => acc + (c.engagement || 0), 0) / contents.length) || 0}%
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Engagement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '44px' }}
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={inputStyle}
              >
                <option value="">All types</option>
                {contentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={filterRestricted}
                onChange={(e) => setFilterRestricted(e.target.value)}
                style={inputStyle}
              >
                <option value="">All</option>
                <option value="true">Restricted only</option>
                <option value="false">Public only</option>
              </select>
            </div>
          </div>

          {/* Content Grid */}
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText style={{ width: '24px', height: '24px', color: 'var(--accent)' }} />
              Registered Content ({filteredContents.length})
            </h2>

            {filteredContents.length === 0 ? (
              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
                <FileText style={{ width: '64px', height: '64px', color: 'var(--border)', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {contents.length === 0 ? 'No content registered' : 'No content found'}
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                  {contents.length === 0
                    ? 'Start by creating your first exclusive content'
                    : 'Try adjusting the search filters'
                  }
                </p>
                {contents.length === 0 && (
                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: '#ffffff',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Plus style={{ width: '20px', height: '20px' }} />
                    Create First Content
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {filteredContents.map((content) => (
                  <ContentCard key={content._id} content={content} />
                ))}
              </div>
            )}
          </div>

          {/* Form Modal */}
          {showForm && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '768px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isEditing
                      ? <Edit3 style={{ width: '24px', height: '24px', color: 'var(--teal)' }} />
                      : <Plus style={{ width: '24px', height: '24px', color: 'var(--accent)' }} />
                    }
                    {isEditing ? 'Edit Content' : 'Create New Content'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <X style={{ width: '24px', height: '24px' }} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text)', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={form.title || ''}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Content title"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: 'var(--text)', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                        Type *
                      </label>
                      <select
                        name="type"
                        value={form.type || 'Article'}
                        onChange={handleChange}
                        style={inputStyle}
                        required
                      >
                        {contentTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--text)', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={form.description || ''}
                      onChange={handleChange}
                      rows={4}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      placeholder="Describe the content..."
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text)', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                        External URL (optional)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Link style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--text-muted)' }} />
                        <input
                          type="url"
                          name="url"
                          value={form.url || ''}
                          onChange={handleChange}
                          style={{ ...inputStyle, paddingLeft: '44px' }}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: 'var(--text)', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                        Associate with Plan
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Crown style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--text-muted)' }} />
                        <select
                          name="planId"
                          value={form.planId || ''}
                          onChange={handleChange}
                          style={{ ...inputStyle, paddingLeft: '44px' }}
                        >
                          <option value="">Public or All Subscribers</option>
                          {availablePlans.map((plan) => (
                            <option key={plan._id} value={plan._id}>
                              {plan.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="restricted"
                        checked={form.restricted || false}
                        onChange={handleChange}
                        style={{ width: '20px', height: '20px' }}
                      />
                      <span style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock style={{ width: '16px', height: '16px' }} />
                        Restricted content (subscribers only)
                      </span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="active"
                        checked={form.active !== false}
                        onChange={handleChange}
                        style={{ width: '20px', height: '20px' }}
                      />
                      <span style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Eye style={{ width: '16px', height: '16px' }} />
                        Active content
                      </span>
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div style={{ display: 'flex', gap: '16px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text)',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: 500,
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--accent)',
                        color: '#ffffff',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: 500,
                        border: 'none',
                        cursor: formLoading ? 'not-allowed' : 'pointer',
                        opacity: formLoading ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      {formLoading ? (
                        <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Save style={{ width: '20px', height: '20px' }} />
                      )}
                      {formLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Content'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(ManageContentPage, { requiresAdmin: true });
