import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { C, iS } from '../styles/tokens';
import Icon from '../components/ui/Icon';
import FormField from '../components/forms/FormField';

const CATS = ['Acceso', 'Hardware', 'Software', 'Red / VPN', 'Seguridad', 'Onboarding', 'Facturación', 'Otro'];
const EMPTY_FORM = { name: '', category: '', content: '' };

export default function TemplatesAdmin({ role }) {
  const isAdmin = role === 'admin';

  const [templates,   setTemplates]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [editing,     setEditing]     = useState(null); // null | 'new' | template-obj
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [formError,   setFormError]   = useState('');
  const [delId,       setDelId]       = useState(null);
  const [deleting,    setDeleting]    = useState(false);
  const [search,      setSearch]      = useState('');
  const [catFilter,   setCatFilter]   = useState('all');

  useEffect(() => {
    api.get('/templates')
      .then(r => setTemplates(r.templates))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const cats = ['all', ...new Set(templates.map(t => t.category).filter(Boolean))];
  const visible = templates
    .filter(t => catFilter === 'all' || t.category === catFilter)
    .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  function openNew() {
    setForm(EMPTY_FORM);
    setFormError('');
    setEditing('new');
  }

  function openEdit(tpl) {
    setForm({ name: tpl.name, category: tpl.category || '', content: tpl.content });
    setFormError('');
    setEditing(tpl);
    setDelId(null);
  }

  async function save() {
    if (!form.name.trim() || !form.content.trim() || saving) return;
    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') {
        const { template } = await api.post('/templates', form);
        setTemplates(ts => [...ts, template].sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        const { template } = await api.patch(`/templates/${editing.id}`, form);
        setTemplates(ts => ts.map(t => t.id === template.id ? template : t));
      }
      setEditing(null);
    } catch (e) {
      setFormError(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function toggle(tpl) {
    try {
      const { template } = await api.patch(`/templates/${tpl.id}/toggle`);
      setTemplates(ts => ts.map(t => t.id === template.id ? template : t));
    } catch { /* noop */ }
  }

  async function del(id) {
    if (deleting) return;
    setDeleting(true);
    try {
      await api.del(`/templates/${id}`);
      setTemplates(ts => ts.filter(t => t.id !== id));
      setDelId(null);
    } catch { /* noop */ }
    finally { setDeleting(false); }
  }

  // ── Form ──────────────────────────────────────────────────────
  if (editing !== null) {
    const isNew = editing === 'new';
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px', maxWidth: 620, margin: '0 auto', width: '100%' }}>
        <button onClick={() => setEditing(null)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: C.text2, cursor: 'pointer', fontSize: 11, marginBottom: 16, padding: 0 }}>
          <Icon d="M19 12H5M12 5l-7 7 7 7" size={11} varColor="--text2" /> Plantillas
        </button>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 1 }}>{isNew ? 'Nueva plantilla' : 'Editar plantilla'}</div>
        <div style={{ fontSize: 11, color: C.text2, marginBottom: 20 }}>{isNew ? 'Creá una respuesta reutilizable' : `Editando plantilla #${editing.id}`}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <FormField label="Nombre">
            <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Ej: Desbloqueo de usuario" style={{ ...iS, width: '100%' }} />
          </FormField>

          <FormField label="Categoría">
            <select value={form.category} onChange={e => f('category', e.target.value)} style={{ ...iS, width: '100%' }}>
              <option value="">Sin categoría</option>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>

          <FormField label="Contenido de la respuesta">
            <textarea
              value={form.content}
              onChange={e => f('content', e.target.value)}
              placeholder="Hola [Nombre], para desbloquear tu usuario…"
              rows={8}
              style={{ ...iS, width: '100%', resize: 'vertical', lineHeight: 1.7, fontFamily: 'inherit' }}
            />
            <div style={{ fontSize: 10, color: C.text2, marginTop: 4 }}>
              Podés usar <code style={{ fontSize: 10 }}>[Nombre]</code>, <code style={{ fontSize: 10 }}>[Ticket]</code> como marcadores de posición.
            </div>
          </FormField>

          {formError && <div style={{ fontSize: 11, color: 'var(--red)' }}>{formError}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => setEditing(null)} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 11, padding: '6px 14px', borderRadius: 4, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={!form.name.trim() || !form.content.trim() || saving}
              style={{ background: form.name.trim() && form.content.trim() && !saving ? 'var(--accent)' : C.bg3, border: 'none', color: form.name.trim() && form.content.trim() && !saving ? '#fff' : C.text2, fontSize: 11, fontWeight: 500, padding: '6px 16px', borderRadius: 4, cursor: 'pointer', transition: 'all .15s' }}
            >
              {saving ? 'Guardando…' : isNew ? 'Crear plantilla' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── List ──────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 22px 14px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 2 }}>Plantillas de respuesta</div>
            <div style={{ fontSize: 11, color: C.text2 }}>Respuestas frecuentes reutilizables para tickets</div>
          </div>
          {isAdmin && (
            <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 500, padding: '6px 12px', borderRadius: 4, cursor: 'pointer', flexShrink: 0 }}>
              <Icon d="M12 4v16m8-8H4" size={11} varColor="--white" /> Nueva plantilla
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar plantillas…" style={{ ...iS, paddingLeft: 28, width: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: 1 }}>
            {cats.map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{ padding: '4px 9px', borderRadius: 3, border: 'none', fontSize: 10, fontWeight: 500, background: catFilter === c ? C.accentMuted : 'transparent', color: catFilter === c ? C.accent : C.text2, cursor: 'pointer' }}>
                {c === 'all' ? 'Todas' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px' }}>
        {loading && <div style={{ fontSize: 12, color: C.text2 }}>Cargando…</div>}
        {!loading && visible.length === 0 && <div style={{ fontSize: 12, color: C.text2 }}>Sin plantillas</div>}
        {visible.map(tpl => (
          <div key={tpl.id}
            style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, padding: '12px 14px', marginBottom: 8, opacity: tpl.active ? 1 : 0.5 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text0, marginBottom: 3 }}>{tpl.name}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {tpl.category && (
                    <span style={{ fontSize: 9, fontWeight: 600, color: C.accent, background: C.accentMuted, padding: '1px 6px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '.05em' }}>{tpl.category}</span>
                  )}
                  {!tpl.active && (
                    <span style={{ fontSize: 9, fontWeight: 600, color: C.text2, background: C.bg3, padding: '1px 6px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '.05em' }}>Inactiva</span>
                  )}
                </div>
              </div>
              {isAdmin && (
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => openEdit(tpl)} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.text1, fontSize: 10, padding: '3px 9px', borderRadius: 3, cursor: 'pointer' }}>Editar</button>
                  <button
                    onClick={() => toggle(tpl)}
                    style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 10, padding: '3px 9px', borderRadius: 3, cursor: 'pointer' }}
                  >
                    {tpl.active ? 'Desactivar' : 'Activar'}
                  </button>
                  {delId === tpl.id ? (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <button onClick={() => setDelId(null)} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 10, padding: '3px 7px', borderRadius: 3, cursor: 'pointer' }}>No</button>
                      <button onClick={() => del(tpl.id)} disabled={deleting} style={{ background: 'var(--red)', border: 'none', color: '#fff', fontSize: 10, fontWeight: 500, padding: '3px 7px', borderRadius: 3, cursor: 'pointer' }}>Sí</button>
                    </div>
                  ) : (
                    <button onClick={() => setDelId(tpl.id)} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 10, padding: '3px 9px', borderRadius: 3, cursor: 'pointer' }}>Eliminar</button>
                  )}
                </div>
              )}
            </div>
            <p style={{ fontSize: 11, color: C.text2, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {tpl.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
