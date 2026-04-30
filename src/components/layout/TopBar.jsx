import { C } from '../../styles/tokens';
import Avatar from '../ui/Avatar';
import ThemeToggle from './ThemeToggle';

export default function TopBar({ user, title, theme, toggleTheme, onLogout }) {
  return (
    <div
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        padding: '0 18px',
        borderBottom: `1px solid ${C.border}`,
        background: C.bg1,
        gap: 12,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500, color: C.text0, flex: 1 }}>{title}</span>

      <ThemeToggle theme={theme} toggle={toggleTheme} />

      {/* User pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <Avatar name={user.name} size={22} />
        <span style={{ fontSize: 11, color: C.text1 }}>{user.name}</span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 500,
            color: C.text2,
            background: C.bg3,
            border: `1px solid ${C.border}`,
            borderRadius: 3,
            padding: '1px 5px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {user.role}
        </span>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        title="Cerrar sesión"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 9px',
          borderRadius: 4,
          border: `1px solid ${C.border}`,
          background: 'transparent',
          cursor: 'pointer',
          color: C.text2,
          fontSize: 11,
          transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--red)';
          e.currentTarget.style.color = 'var(--red)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text2)';
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Salir
      </button>
    </div>
  );
}
