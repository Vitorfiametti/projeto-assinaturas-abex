"use client";
// src/pages/member/content.tsx
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";
import Layout from "@/components/Layout";
import {
  FileText,
  Video,
  Calendar,
  Search,
  Filter,
  Heart,
  Star,
  Play,
  Book,
  BookOpen,
  Headphones,
  Monitor,
  Archive,
  ExternalLink,
  Clock,
  Eye,
  TrendingUp,
  Lock,
  Crown,
  AlertCircle,
  X,
  Download,
  Share,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
} from "lucide-react";

interface Content {
  _id: string;
  title: string;
  description: string;
  type: string;
  url?: string;
  publishDate: string;
  restricted: boolean;
  planId?: string;
  plan?: { _id: string; name: string };
  views?: number;
  engagement?: number;
  thumbnail?: string;
  isFavorite?: boolean;
  hasAccess?: boolean;
}

function MyContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState<Content[]>([]);
  const [filteredContents, setFilteredContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterAccess, setFilterAccess] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentTab, setCurrentTab] = useState("all");

  const contentTypes = [
    { value: "Article", label: "Artigo", icon: FileText, action: "Ler" },
    { value: "Video", label: "Vídeo", icon: Video, action: "Assistir" },
    { value: "Event", label: "Evento", icon: Calendar, action: "Participar" },
    { value: "Podcast", label: "Podcast", icon: Headphones, action: "Ouvir" },
    { value: "Course", label: "Curso", icon: BookOpen, action: "Começar" },
    { value: "Webinar", label: "Webinar", icon: Monitor, action: "Assistir" },
    { value: "Other", label: "Outro", icon: Archive, action: "Ver Mais" },
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchContents();
    }
  }, [status, router.query]);

  useEffect(() => {
    filterAndSortContent();
  }, [contents, searchTerm, filterType, filterAccess, sortBy, currentTab]);

  const fetchContents = async () => {
    setLoading(true);
    setError(null);

    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/member/content?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      const data = await res.json();

      if (data.success) {
        console.log('📋 Content loaded:', {
          total: data.data.length,
          accessible: data.data.filter((c: any) => c.hasAccess).length
        });

        setContents(data.data);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      console.error('❌ Error loading content:', err);
      setError(err.message || 'Erro ao carregar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshContent = async () => {
    setLoading(true);
    await fetchContents();
  };

  const filterAndSortContent = () => {
    let filtered = contents;

    // Filter by tab
    if (currentTab === "favorites") {
      filtered = filtered.filter((content) => content.isFavorite);
    } else if (currentTab === "accessible") {
      filtered = filtered.filter((content) => content.hasAccess);
    } else if (currentTab === "recent") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(
        (content) => new Date(content.publishDate) >= oneWeekAgo
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (content) =>
          content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          content.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType) {
      filtered = filtered.filter((content) => content.type === filterType);
    }

    // Filter by access
    if (filterAccess === "accessible") {
      filtered = filtered.filter((content) => content.hasAccess);
    } else if (filterAccess === "restricted") {
      filtered = filtered.filter((content) => !content.hasAccess);
    }

    // Sort content
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.publishDate).getTime() -
            new Date(b.publishDate).getTime()
          );
        case "popular":
          return (b.views || 0) - (a.views || 0);
        case "title":
          return a.title.localeCompare(b.title);
        case "newest":
        default:
          return (
            new Date(b.publishDate).getTime() -
            new Date(a.publishDate).getTime()
          );
      }
    });

    setFilteredContents(filtered);
  };

  const toggleFavorite = async (contentId: string) => {
    try {
      const res = await fetch("/api/member/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId }),
      });
      const data = await res.json();
      if (data.success) {
        setContents(
          contents.map((c) =>
            c._id === contentId ? { ...c, isFavorite: !c.isFavorite } : c
          )
        );
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleContentClick = (content: Content) => {
    if (!content.hasAccess) {
      router.push("/member/plans");
      return;
    }

    if (content.url) {
      window.open(content.url, "_blank");
    }

    // Track view
    fetch("/api/member/view-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId: content._id }),
    }).catch(console.error);
  };

  const getTypeConfig = (type: string) => {
    return contentTypes.find((t) => t.value === type) || contentTypes[0];
  };

  const typeIconColors: Record<string, string> = {
    Article: '#3b82f6',
    Video: '#e8192c',
    Event: '#8b5cf6',
    Podcast: '#22c55e',
    Course: '#f97316',
    Webinar: '#6366f1',
    Other: '#6b7280',
  };

  const ContentCard = ({ content }: { content: Content }) => {
    const typeConfig = getTypeConfig(content.type);
    const IconComponent = typeConfig.icon;
    const iconBg = content.hasAccess
      ? (typeIconColors[typeConfig.value] || '#6b7280')
      : '#9ca3af';

    return (
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: `1px solid ${!content.hasAccess ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: '16px',
          padding: '1.5rem',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s',
        }}
        onClick={() => handleContentClick(content)}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '12px',
              backgroundColor: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconComponent style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(content._id);
              }}
              style={{
                padding: '0.5rem',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: content.isFavorite ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                color: content.isFavorite ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Heart
                style={{
                  width: '1rem',
                  height: '1rem',
                  fill: content.isFavorite ? 'var(--accent)' : 'none',
                }}
              />
            </button>

            {/* Access Status */}
            {!content.hasAccess ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                }}
              >
                <Lock style={{ width: '0.75rem', height: '0.75rem' }} />
                Restrito
              </div>
            ) : content.restricted ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--teal-subtle)',
                  color: 'var(--teal)',
                }}
              >
                <Crown style={{ width: '0.75rem', height: '0.75rem' }} />
                Premium
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                }}
              >
                <Eye style={{ width: '0.75rem', height: '0.75rem' }} />
                Free
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '1rem' }}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
              margin: '0 0 0.5rem 0',
              color: content.hasAccess ? 'var(--text)' : 'var(--text-muted)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {content.title}
          </h3>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              margin: '0 0 0.75rem 0',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {content.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar style={{ width: '0.75rem', height: '0.75rem' }} />
              {new Date(content.publishDate).toLocaleDateString("pt-BR")}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Eye style={{ width: '0.75rem', height: '0.75rem' }} />
              {content.views || 0}
            </span>
            {content.plan && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Crown style={{ width: '0.75rem', height: '0.75rem' }} />
                {content.plan.name}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          {!content.hasAccess ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--accent)', fontSize: '0.875rem', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>
                Assine um plano para acessar
              </p>
              <button
                style={{
                  width: '100%',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.95rem',
                }}
              >
                <Crown style={{ width: '1rem', height: '1rem' }} />
                Assinar Plano
              </button>
            </div>
          ) : (
            <button
              style={{
                width: '100%',
                backgroundColor: 'var(--accent)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
              }}
            >
              <Play style={{ width: '1rem', height: '1rem' }} />
              {typeConfig.action}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (status === "loading" || loading) {
    return (
      <Layout activeTab="member-content">
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '4rem',
                height: '4rem',
                border: '4px solid var(--border)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', margin: 0 }}>Carregando conteúdo...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout activeTab="member-content">
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
          <div
            style={{
              textAlign: 'center',
              backgroundColor: 'var(--accent-subtle)',
              border: '1px solid var(--accent)',
              borderRadius: '16px',
              padding: '2rem',
            }}
          >
            <AlertCircle style={{ width: '4rem', height: '4rem', color: 'var(--accent)', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--accent)', fontSize: '1.125rem', margin: 0 }}>Acesso negado</p>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { key: "all", label: "Todo Conteúdo", icon: Book },
    { key: "accessible", label: "Disponível", icon: Eye },
    { key: "favorites", label: "Favoritos", icon: Heart },
    { key: "recent", label: "Recentes", icon: Clock },
  ];

  const tabLabelMap: Record<string, string> = {
    all: "Todo Conteúdo",
    favorites: "Favoritos",
    accessible: "Disponível",
    recent: "Recentes",
  };

  return (
    <Layout activeTab="member-content">
      <div
        style={{
          backgroundColor: 'var(--bg)',
          minHeight: '100vh',
          padding: '1rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h1
                style={{
                  fontSize: '2.25rem',
                  fontWeight: 900,
                  color: 'var(--text)',
                  textTransform: 'uppercase',
                  margin: '0 0 0.5rem 0',
                }}
              >
                Meu Conteúdo
              </h1>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                Explore e acesse seu conteúdo exclusivo
              </p>
            </div>

            {/* Botão de Refresh */}
            <button
              onClick={handleRefreshContent}
              disabled={loading}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text)',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
              title="Atualizar conteúdo"
            >
              <RotateCcw
                style={{
                  width: '1rem',
                  height: '1rem',
                  animation: loading ? 'spin 0.8s linear infinite' : 'none',
                }}
              />
              Atualizar
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              style={{
                backgroundColor: 'var(--accent-subtle)',
                border: '1px solid var(--accent)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent)', flexShrink: 0 }} />
              <p style={{ color: 'var(--accent)', margin: 0 }}>{error}</p>
              <button
                onClick={() => setError(null)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0 }}
              >
                <X style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>
          )}

          {/* Content Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: currentTab === tab.key ? 'none' : '1px solid var(--border)',
                  backgroundColor: currentTab === tab.key ? 'var(--accent)' : 'var(--bg-card)',
                  color: currentTab === tab.key ? 'white' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <tab.icon style={{ width: '1rem', height: '1rem' }} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Search
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '1.25rem',
                    height: '1.25rem',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Buscar conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    paddingLeft: '3rem',
                    paddingRight: '1rem',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderRadius: '10px',
                    outline: 'none',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                <option value="">Todos os tipos</option>
                {contentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <select
                value={filterAccess}
                onChange={(e) => setFilterAccess(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                <option value="">Todo o conteúdo</option>
                <option value="accessible">Disponível</option>
                <option value="restricted">Restrito</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
                <option value="popular">Mais populares</option>
                <option value="title">Por título</option>
              </select>
            </div>
          </div>

          {/* Content Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                value: contents.length,
                label: 'Total',
                iconBg: '#3b82f6',
                Icon: Book,
              },
              {
                value: contents.filter((c) => c.hasAccess).length,
                label: 'Disponível',
                iconBg: '#22c55e',
                Icon: Eye,
              },
              {
                value: contents.filter((c) => c.isFavorite).length,
                label: 'Favoritos',
                iconBg: 'var(--accent)',
                Icon: Heart,
              },
              {
                value:
                  Math.round(
                    contents.reduce((acc, c) => acc + (c.views || 0), 0) /
                      contents.length
                  ) || 0,
                label: 'Média de Views',
                iconBg: 'var(--teal)',
                Icon: TrendingUp,
              },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: stat.iconBg,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <stat.Icon style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                </div>
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                    {stat.value}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--text)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 0 1.5rem 0',
              }}
            >
              <FileText style={{ width: '1.5rem', height: '1.5rem', color: 'var(--accent)' }} />
              {tabLabelMap[currentTab] || 'Todo Conteúdo'} ({filteredContents.length})
            </h2>

            {filteredContents.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '3rem',
                  textAlign: 'center',
                }}
              >
                <FileText style={{ width: '4rem', height: '4rem', color: 'var(--border)', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>
                  {currentTab === "favorites"
                    ? "Nenhum favorito ainda"
                    : currentTab === "accessible"
                    ? "Sem conteúdo disponível"
                    : "Nenhum conteúdo encontrado"}
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', margin: '0 0 1.5rem 0' }}>
                  {currentTab === "favorites"
                    ? "Comece a favoritar conteúdos"
                    : currentTab === "accessible"
                    ? "Assine um plano para acessar mais conteúdo"
                    : "Tente ajustar os filtros de busca"}
                </p>
                {(currentTab === "accessible" || currentTab === "all") && (
                  <button
                    onClick={() => router.push("/member/plans")}
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Crown style={{ width: '1.25rem', height: '1.25rem' }} />
                    Ver Planos
                  </button>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {filteredContents.map((content) => (
                  <ContentCard key={content._id} content={content} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(MyContentPage);
