import { QUEUES } from '../../constants';
import { C } from '../../styles/tokens';
import { fmtTs } from '../../utils/time';
import Icon from '../ui/Icon';
import StatusBadge from '../ui/StatusBadge';
import QDot from '../ui/QDot';

const H_CFG = {
  created:      { d: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4m0 4v.01', vc: '--blue'   },
  status_change:{ d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',     vc: '--accent'  },
  queue_move:   { d: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', vc: '--teal'   },
  assign:       { d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', vc: '--amber' },
  comment:      { d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.42-4.03 8-9 8a9.9 9.9 0 01-4.26-.96L3 21l1.9-5.06C3.71 14.46 3 13.31 3 12c0-4.42 4.03-8 9-8s9 3.58 9 8z', vc: '--text1' },
};

const ARROW = 'M5 12h14M12 5l7 7-7 7';

export default function HistoryEntry({ entry, isLast }) {
  const cfg    = H_CFG[entry.type] || H_CFG.comment;
  const fromQ  = QUEUES.find((q) => q.id === entry.from);
  const toQ    = QUEUES.find((q) => q.id === entry.to);

  return (
    <div style={{ display: 'flex', gap: 12, paddingBottom: isLast ? 0 : 18, position: 'relative' }}>
      {!isLast && (
        <div style={{ position: 'absolute', left: 11, top: 26, bottom: 0, width: 1, background: 'var(--border)' }} />
      )}

      {/* Icon bubble */}
      <div
        style={{
          width: 23,
          height: 23,
          borderRadius: '50%',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: 'var(--bg2)',
        }}
      >
        <Icon d={cfg.d} size={11} varColor={cfg.vc} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingTop: 2, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: C.text0 }}>{entry.agent}</span>
          <span style={{ fontSize: 10, color: C.text2 }}>{fmtTs(entry.timestamp)}</span>
          {entry.category && entry.type === 'comment' && (
            <span style={{ fontSize: 10, color: C.accent, background: C.accentMuted, padding: '1px 6px', borderRadius: 3, fontWeight: 500 }}>
              {entry.category}
            </span>
          )}
        </div>

        {entry.type === 'status_change' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: entry.comment ? 5 : 0 }}>
            <StatusBadge status={entry.from || 'new'} />
            <Icon d={ARROW} size={11} varColor="--text2" />
            <StatusBadge status={entry.to} />
          </div>
        )}

        {entry.type === 'queue_move' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: entry.comment ? 5 : 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.text1 }}>
              <QDot qid={entry.from} />{fromQ ? fromQ.name : entry.from}
            </span>
            <Icon d={ARROW} size={11} varColor="--text2" />
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.teal, fontWeight: 500 }}>
              <QDot qid={entry.to} />{toQ ? toQ.name : entry.to}
            </span>
          </div>
        )}

        {entry.type === 'created' && !entry.comment && (
          <div style={{ fontSize: 12, color: C.text2 }}>Ticket registrado</div>
        )}

        {entry.comment && (
          <div
            style={{
              fontSize: 12,
              color: C.text1,
              lineHeight: 1.65,
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 5,
              padding: '7px 10px',
              marginTop: 2,
            }}
          >
            {entry.comment}
          </div>
        )}
      </div>
    </div>
  );
}
