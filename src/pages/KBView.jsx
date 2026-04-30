import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { C, iS } from '../styles/tokens';
import Icon from '../components/ui/Icon';
import { fmtTs } from '../utils/time';

export default function KBView({ role }) {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [cat,      setCat]      = useState('all');
  const [sel,      setSel]      = useState(null);

  useEffect(() => {
    api.get('/kb')
      .then(r => setArticles(r.articles))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cats = ['all', ...new Set(articles.map(a => a.cat).filter(Boolean))];
  const vis  = articles
    .filter(a => cat === 'all' || a.cat === cat)
    .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()))
    .filter(a => role !== 'customer' || a.status === 'published');

  async function openArticle(a) {
    try {
      const { article } = await api.get(`/kb/${a.id}`);
      setSel(article);
      setArticles(arts => arts.map(x => x.id === article.id ? article : x));
    } catch { setSel(a); }
  }

  if (sel) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px', maxWidth: 660, margin: '0 auto', width: '100%' }}>
        <button onClick={() => setSel(null)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: C.text2, cursor: 'pointer', fontSize: 11, marginBottom: 16, padding: 0 }}>
          <Icon d="M19 12H5M12 5l-7 7 7 7" size={11} varColor="--text2" /> Base de conocimiento
        </button>
        <div style={{ fontSize: 10, color: C.accent, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{sel.cat}</div>
        <div style={{ fontSize: 19, fontWeight: 600, color: C.text0, marginBottom: 8, lineHeight: 1.3 }}>{sel.title}</div>
        <div style={{ display: 'flex', gap: 8, fontSize: 10, color: C.text2, marginBottom: 20 }}>
          <span>{sel.id}</span>·<span>{sel.views?.toLocaleString()} vistas</span>·<span>{fmtTs(sel.updated_at)}</span>
        </div>
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, padding: 18 }}>
          <div style={{ background: C.bg3, borderLeft: '2px solid var(--accent)', padding: '8px 12px', borderRadius: 3, marginBottom: 12, fontSize: 12, color: C.text1 }}>
            💡 Si el problema persiste, abrí un ticket con referencia{' '}
            <span style={{ fontFamily: 'IBM Plex Mono', color: C.accent }}>{sel.id}</span>
          </div>
          {sel.content ? (
            <p style={{ color: C.text1, fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{sel.content}</p>
          ) : (
            <p style={{ color: C.text2, fontSize: 12, lineHeight: 1.7 }}>Contenido no disponible.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 22px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 2 }}>Base de Conocimiento</div>
        <div style={{ fontSize: 11, color: C.text2, marginBottom: 13 }}>Guías y respuestas frecuentes</div>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar artículos…" style={{ ...iS, paddingLeft: 28, width: '100%' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: 170, borderRight: `1px solid ${C.border}`, padding: '8px 4px', overflowY: 'auto', flexShrink: 0 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ width: '100%', textAlign: 'left', background: cat === c ? C.accentMuted : 'transparent', border: 'none', color: cat === c ? C.accent : C.text1, fontSize: 11, padding: '5px 10px', borderRadius: 4, cursor: 'pointer', marginBottom: 1 }}>
              {c === 'all' ? 'Todos' : c}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {loading && <div style={{ fontSize: 12, color: C.text2, padding: 8 }}>Cargando…</div>}
          {!loading && vis.length === 0 && <div style={{ fontSize: 12, color: C.text2, padding: 8 }}>Sin resultados</div>}
          {!loading && vis.map(a => (
            <div key={a.id} onClick={() => openArticle(a)}
              style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 5, padding: '10px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, transition: 'border-color 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text0, marginBottom: 3 }}>{a.title}</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 10, color: C.text2 }}>
                  <span style={{ color: C.accent }}>{a.cat}</span>·
                  <span>{a.views?.toLocaleString()}</span>·
                  <span>{fmtTs(a.updated_at)}</span>
                  {a.status === 'draft' && <span style={{ color: C.amber }}>borrador</span>}
                </div>
              </div>
              <Icon d="M9 18l6-6-6-6" size={11} varColor="--text2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
