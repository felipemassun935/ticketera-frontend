export default function Dot({ varColor, hex, size = 6 }) {
  const col = hex || `var(${varColor})`;
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: col,
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  );
}
