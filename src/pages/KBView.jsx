import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { C, iS } from '../styles/tokens';
import Icon from '../components/ui/Icon';
import { fmtTs } from '../utils/time';
import FormField from '../components/forms/FormField';

const KB_CATS = ['Acceso', 'Infraestructura', 'Software', 'Hardware', 'RRHH', 'Soporte', 'Seguridad', 'Dev', 'Otro'];

const EMPTY_FORM = { title: '', cat: '', content: '', status: 'draft' };

export default function KBView({ role }) {
  const isAdmin = role === 'admin';

  const [articles,    setArticles]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [cat,         setCat]         = useState('all');
  const [sel,         setSel]         = useState(null);
  const [editing,     setEditing]     = useState(null); // null | article-obj | 'new'
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [formError,   setFormError]   = useState('');
  const [delConfirm,  setDelConfirm]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  useEffect(() => {
    api.get('/kb')
      .then(r => setArticles(r.articles))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cats = ['all', ...new Set([...KB_CATS, ...articles.map(a => a.cat).filter(Boolean)])];
  const vis  = articles
    .filter(a => cat === 'all' || a.cat === cat)
    .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()))
    .filter(a => role !== 'customer' || a.status === 'published');

  function f(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function openNew() {
    setForm(EMPTY_FORM);
    setFormError('');
    setEditing('new');
    setSel(null);
  }

  function openEdit(article) {
    setForm({ title: article.title, cat: article.cat || '', content: article.content || '', status: article.status });
    setFormError('');
    setEditing(article);
    setDelConfirm(false);
  }

  async function openArticle(a) {
    try {
      const { article } = await api.get(`/kb/${a.id}`);
      setSel(article);
      setArticles(arts => arts.map(x => x.id === article.id ? article : x));
    } catch { setSel(a); }
  }

  async function saveArticle() {
    if (!form.title.trim() || saving) return;
    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') {
        const { article } = await api.post('/kb', form);
        setArticles(arts => [article, ...arts]);
        setSel(article);
      } else {
        const { article } = await api.patch(`/kb/${editing.id}`, form);
        setArticles(arts => arts.map(a => a.id === article.id ? article : a));
        setSel(article);
      }
      setEditing(null);
    } catch (e) {
      setFormError(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function deleteArticle() {
    if (deleting || !sel) return;
    setDeleting(true);
    try {
      await api.del(`/kb/${sel.id}`);
      setArticles(arts => arts.filter(a => a.id !== sel.id));
      setSel(null);
      setDelConfirm(false);
    } catch (e) {
      setFormError(e.message || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  }

  // ── Edit / Create form ─────────────────────────────────────────
  if (editing !== null) {
    const isNew = editing === 'new';
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px', maxWidth: 660, margin: '0 auto', width: '100%' }}>
        <button onClick={() => { setEditing(null); }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: C.text2, cursor: 'pointer', fontSize: 11, marginBottom: 16, padding: 0 }}>
          <Icon d="M19 12H5M12 5l-7 7 7 7" size={11} varColor="--text2" /> Volver
        </button>

        <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 1 }}>
          {isNew ? 'Nuevo artículo' : 'Editar artículo'}
        </div>
        <div style={{ fontSize: 11, color: C.text2, marginBottom: 20 }}>
          {isNew ? 'Crea un artículo en la base de conocimiento' : `Editando ${editing.id}`}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <FormField label="Título">
            <input value={form.title} onChange={e => f('title', e.target.value)} placeholder="Título del artículo…" style={{ ...iS, width: '100%' }} />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <FormField label="Categoría">
              <select value={form.cat} onChange={e => f('cat', e.target.value)} style={{ ...iS, width: '100%' }}>
                <option value="">Sin categoría</option>
                {KB_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Estado">
              <select value={form.status} onChange={e => f('status', e.target.value)} style={{ ...iS, width: '100%' }}>
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </FormField>
          </div>

          <FormField label="Contenido">
            <textarea
              value={form.content}
              onChange={e => f('content', e.target.value)}
              placeholder="Pasos para resolver el problema, información relevante…"
              rows={10}
              style={{ ...iS, width: '100%', resize: 'vertical', lineHeight: 1.7, fontFamily: 'inherit' }}
            />
          </FormField>

          {formError && <div style={{ fontSize: 11, color: 'var(--red)' }}>{formError}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => setEditing(null)} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 11, padding: '6px 14px', borderRadius: 4, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button
              onClick={saveArticle}
              disabled={!form.title.trim() || saving}
              style={{ background: form.title.trim() && !saving ? 'var(--accent)' : C.bg3, border: 'none', color: form.title.trim() && !saving ? '#fff' : C.text2, fontSize: 11, fontWeight: 500, padding: '6px 16px', borderRadius: 4, cursor: form.title.trim() && !saving ? 'pointer' : 'default', transition: 'all 0.15s' }}
            >
              {saving ? 'Guardando…' : isNew ? 'Crear artículo' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Article detail ─────────────────────────────────────────────
  if (sel) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px', maxWidth: 660, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => setSel(null)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: C.text2, cursor: 'pointer', fontSize: 11, padding: 0 }}>
            <Icon d="M19 12H5M12 5l-7 7 7 7" size={11} varColor="--text2" /> Base de conocimiento
          </button>
          {isAdmin && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => openEdit(sel)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: `1px solid ${C.border}`, color: C.text1, fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: 'pointer', transition: 'border-color 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" size={11} varColor="--text2" /> Editar
              </button>
              {!delConfirm ? (
                <button
                  onClick={() => setDelConfirm(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: 'pointer', transition: 'all 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = C.text2; }}
                >
                  <Icon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={11} varColor="--text2" /> Eliminar
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--red)' }}>¿Confirmar?</span>
                  <button onClick={() => setDelConfirm(false)} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 10, padding: '3px 8px', borderRadius: 3, cursor: 'pointer' }}>No</button>
                  <button onClick={deleteArticle} disabled={deleting} style={{ background: 'var(--red)', border: 'none', color: '#fff', fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 3, cursor: 'pointer' }}>
                    {deleting ? '…' : 'Sí, eliminar'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ fontSize: 10, color: C.accent, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{sel.cat}</div>
        <div style={{ fontSize: 19, fontWeight: 600, color: C.text0, marginBottom: 8, lineHeight: 1.3 }}>{sel.title}</div>
        <div style={{ display: 'flex', gap: 8, fontSize: 10, color: C.text2, marginBottom: 8, alignItems: 'center' }}>
          <span>{sel.id}</span>·<span>{sel.views?.toLocaleString()} vistas</span>·<span>{fmtTs(sel.updated_at)}</span>
          {sel.status === 'draft' && (
            <span style={{ background: C.bg3, color: 'var(--amber)', fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Borrador</span>
          )}
        </div>

        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, padding: 18 }}>
          <div style={{ background: C.bg3, borderLeft: '2px solid var(--accent)', padding: '8px 12px', borderRadius: 3, marginBottom: 12, fontSize: 12, color: C.text1 }}>
            💡 Si el problema persiste, abrí un ticket con referencia{' '}
            <span style={{ fontFamily: 'IBM Plex Mono', color: C.accent }}>{sel.id}</span>
          </div>
          {sel.content ? (
            <p style={{ color: C.text1, fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{sel.content}</p>
          ) : (
            <p style={{ color: C.text2, fontSize: 12, lineHeight: 1.7, margin: 0 }}>Contenido no disponible.</p>
          )}
        </div>
      </div>
    );
  }

  // ── Article list ───────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 22px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 2 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 2 }}>Base de Conocimiento</div>
            <div style={{ fontSize: 11, color: C.text2, marginBottom: 13 }}>Guías y respuestas frecuentes</div>
          </div>
          {isAdmin && (
            <button
              onClick={openNew}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 500, padding: '6px 12px', borderRadius: 4, cursor: 'pointer', flexShrink: 0 }}
            >
              <Icon d="M12 4v16m8-8H4" size={11} varColor="--white" /> Nuevo artículo
            </button>
          )}
        </div>
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
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text0, marginBottom: 3 }}>{a.title}</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 10, color: C.text2, alignItems: 'center' }}>
                  {a.cat && <span style={{ color: C.accent }}>{a.cat}</span>}
                  {a.cat && <span>·</span>}
                  <span>{a.views?.toLocaleString()} vistas</span>·
                  <span>{fmtTs(a.updated_at)}</span>
                  {a.status === 'draft' && (
                    <span style={{ background: C.bg3, color: 'var(--amber)', fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Borrador</span>
                  )}
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
