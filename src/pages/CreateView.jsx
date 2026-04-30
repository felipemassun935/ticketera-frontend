import { useState } from 'react';
import { QUEUES, PRI_CFG, CATEGORIES, SLA_MAP } from '../constants';
import { C, iS } from '../styles/tokens';
import FormField from '../components/forms/FormField';

const EMPTY_FORM = { title: '', queue: 'it', category: 'Infraestructura', priority: 'medium', desc: '', tags: '' };

export default function CreateView() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [ok,   setOk]   = useState(false);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  if (ok) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(120,176,122,0.15)', border: '1px solid rgba(120,176,122,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: C.text0 }}>Ticket creado</div>
        <div style={{ fontSize: 11, color: C.text2 }}>
          ID: <span style={{ fontFamily: 'IBM Plex Mono', color: C.accent }}>TK-1042</span>
        </div>
        <button
          onClick={() => { setOk(false); setForm(EMPTY_FORM); }}
          style={{ background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 500, padding: '6px 18px', borderRadius: 4, cursor: 'pointer', marginTop: 4 }}
        >
          Crear otro
        </button>
      </div>
    );
  }

  const isValid = form.title && form.desc;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px', maxWidth: 580, margin: '0 auto', width: '100%' }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 1 }}>Nuevo ticket</div>
      <div style={{ fontSize: 11, color: C.text2, marginBottom: 20 }}>Registra una solicitud de soporte</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <FormField label="Asunto">
          <input
            value={form.title}
            onChange={(e) => f('title', e.target.value)}
            placeholder="Describe el problema…"
            style={{ ...iS, width: '100%' }}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <FormField label="Bandeja">
            <select value={form.queue} onChange={(e) => f('queue', e.target.value)} style={{ ...iS, width: '100%' }}>
              {QUEUES.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
          </FormField>

          <FormField label="Categoría">
            <select value={form.category} onChange={(e) => f('category', e.target.value)} style={{ ...iS, width: '100%' }}>
              {CATEGORIES.map((o) => <option key={o}>{o}</option>)}
            </select>
          </FormField>

          <FormField label="Prioridad">
            <select value={form.priority} onChange={(e) => f('priority', e.target.value)} style={{ ...iS, width: '100%' }}>
              {Object.entries(PRI_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label="Descripción">
          <textarea
            value={form.desc}
            onChange={(e) => f('desc', e.target.value)}
            placeholder="Detalla el problema, pasos y contexto…"
            rows={4}
            style={{ ...iS, width: '100%', resize: 'vertical', lineHeight: 1.6 }}
          />
        </FormField>

        <FormField label="Etiquetas">
          <input
            value={form.tags}
            onChange={(e) => f('tags', e.target.value)}
            placeholder="vpn, windows (separadas por coma)"
            style={{ ...iS, width: '100%' }}
          />
        </FormField>

        {/* SLA preview */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 5, padding: '10px 12px' }}>
          <div style={{ fontSize: 9, color: C.text2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
            SLA estimado — {PRI_CFG[form.priority]?.label}
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['1ª Respuesta', SLA_MAP[form.priority]?.[0]], ['Resolución', SLA_MAP[form.priority]?.[1]]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 10, color: C.text2, marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.accent }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={() => setForm(EMPTY_FORM)}
            style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 11, padding: '6px 14px', borderRadius: 4, cursor: 'pointer' }}
          >
            Limpiar
          </button>
          <button
            onClick={() => { if (isValid) setOk(true); }}
            style={{
              background: isValid ? 'var(--accent)' : C.bg3,
              border: 'none',
              color: isValid ? '#fff' : C.text2,
              fontSize: 11,
              fontWeight: 500,
              padding: '6px 16px',
              borderRadius: 4,
              cursor: isValid ? 'pointer' : 'default',
              transition: 'all 0.15s',
            }}
          >
            Crear ticket
          </button>
        </div>
      </div>
    </div>
  );
}
