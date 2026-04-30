import { useState } from 'react';
import { KB_ARTS } from '../constants/kb';
import { C, iS } from '../styles/tokens';
import Icon from '../components/ui/Icon';

export default function KBView({ role }) {
  const [search, setSearch] = useState('');
  const [cat,    setCat]    = useState('all');
  const [sel,    setSel]    = useState(null);

  const cats = ['all', ...new Set(KB_ARTS.map((a) => a.cat))];
  const vis  = KB_ARTS
    .filter((a) => cat === 'all' || a.cat === cat)
    .filter((a) => !search || a.title.toLowerCase().includes(search.toLowerCase()))
    .filter((a) => role !== 'customer' || a.status === 'published');

  if (sel) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px', maxWidth: 660, margin: '0 auto', width: '100%' }}>
        <button
          onClick={() => setSel(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: C.text2, cursor: 'pointer', fontSize: 11, marginBottom: 16, padding: 0 }}
        >
          <Icon d="M19 12H5M12 5l-7 7 7 7" size={11} varColor="--text2" /> Base de conocimiento
        </button>
        <div style={{ fontSize: 10, color: C.accent, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{sel.cat}</div>
        <div style={{ fontSize: 19, fontWeight: 600, color: C.text0, marginBottom: 8, lineHeight: 1.3 }}>{sel.title}</div>
        <div style={{ display: 'flex', gap: 8, fontSize: 10, color: C.text2, marginBottom: 20 }}>
          <span>{sel.id}</span>·<span>{sel.views.toLocaleString()} vistas</span>·<span>{sel.date}</span>
        </div>
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, padding: 18 }}>
          <div style={{ background: C.bg3, borderLeft: '2px solid var(--accent)', padding: '8px 12px', borderRadius: 3, marginBottom: 12, fontSize: 12, color: C.text1 }}>
            💡 Si el problema persiste, abre un ticket con referencia{' '}
            <span style={{ fontFamily: 'IBM Plex Mono', color: C.accent }}>{sel.id}</span>
          </div>
          <p style={{ color: C.text2, fontSize: 12, lineHeight: 1.7 }}>
            Contenido completo disponible en producción. Prototipo de Ticketera — Equilybrio Group.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 22px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 2 }}>Base de Conocimiento</div>
        <div style={{ fontSize: 11, color: C.text2, marginBottom: 13 }}>Guías y respuestas frecuentes</div>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar artículos…"
            style={{ ...iS, paddingLeft: 28, width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Category filter */}
        <div style={{ width: 170, borderRight: `1px solid ${C.border}`, padding: '8px 4px', overflowY: 'auto', flexShrink: 0 }}>
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: cat === c ? C.accentMuted : 'transparent',
                border: 'none',
                color: cat === c ? C.accent : C.text1,
                fontSize: 11,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                marginBottom: 1,
              }}
            >
              {c === 'all' ? 'Todos' : c}
            </button>
          ))}
        </div>

        {/* Articles list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {role === 'admin' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <button style={{ background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 10, fontWeight: 500, padding: '4px 12px', borderRadius: 3, cursor: 'pointer' }}>
                + Nuevo artículo
              </button>
            </div>
          )}

          {vis.map((a) => (
            <div
              key={a.id}
              onClick={() => setSel(a)}
              style={{
                background: C.bg2,
                border: `1px solid ${C.border}`,
                borderRadius: 5,
                padding: '10px 13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 5,
                transition: 'border-color 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text0, marginBottom: 3 }}>{a.title}</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 10, color: C.text2 }}>
                  <span style={{ color: C.accent }}>{a.cat}</span>·
                  <span>{a.views.toLocaleString()}</span>·
                  <span>{a.date}</span>
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
