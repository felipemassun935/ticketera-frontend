const COLS = ['#CF7452', '#5ca89a', '#c98c4a', '#c46262', '#6892b4', '#9b78b0'];

export default function Avatar({ name, size = 24 }) {
  const col = COLS[name.charCodeAt(0) % COLS.length];
  const ini = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `${col}22`,
        border: `1px solid ${col}55`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.35,
        fontWeight: 600,
        color: col,
        flexShrink: 0,
        letterSpacing: '0.01em',
      }}
    >
      {ini}
    </div>
  );
}
