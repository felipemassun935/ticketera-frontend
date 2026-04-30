import { PRI_CFG } from '../../constants';
import Dot from './Dot';

export default function PriBadge({ priority }) {
  const c = PRI_CFG[priority] || PRI_CFG.medium;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        color: `var(${c.varColor})`,
      }}
    >
      <Dot varColor={c.varColor} size={5} />
      {c.label}
    </span>
  );
}
