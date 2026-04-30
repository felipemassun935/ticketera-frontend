import { C } from '../../styles/tokens';

export default function FormField({ label, children }) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 9,
          fontWeight: 600,
          color: C.text2,
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
