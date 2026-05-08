import { useAdmin } from '../../context/AdminContext';
import { PRI_CFG } from '../../constants';

export default function PriBadge({ priority }) {
  const { priorities } = useAdmin();

  const dyn = priorities.find(p => p.id === priority);
  if (dyn) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, lineHeight: 1, color: dyn.color }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: dyn.color, display: 'inline-block', flexShrink: 0 }} />
        {dyn.label}
      </span>
    );
  }

  // fallback for old hardcoded priorities
  const c = PRI_CFG[priority] || PRI_CFG.medium;
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, lineHeight: 1, color: `var(${c.varColor})` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: `var(${c.varColor})`, display: 'inline-block', flexShrink: 0 }} />
      {c.label}
    </span>
  );
}
