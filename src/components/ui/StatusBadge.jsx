import { STATUS_CFG } from '../../constants';

export default function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.open;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 500,
        color: `var(${c.varColor})`,
        letterSpacing: '0.01em',
      }}
    >
      {c.label}
    </span>
  );
}
