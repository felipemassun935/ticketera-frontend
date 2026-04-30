import { C } from '../../styles/tokens';

export function PanelSection({ label, children }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: C.text2,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export function PanelRow({ l, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
      <span style={{ color: C.text2 }}>{l}</span>
      <span style={{ color: C.text1, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
    </div>
  );
}
