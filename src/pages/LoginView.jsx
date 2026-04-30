import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { C, iS } from '../styles/tokens';
import ThemeToggle from '../components/layout/ThemeToggle';

export default function LoginView() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    // small artificial delay so it doesn't feel instant
    await new Promise((r) => setTimeout(r, 320));
    const ok = login(email, password);
    if (!ok) {
      setError('Credenciales incorrectas');
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: C.bg0,
      }}
    >
      <div style={{ width: '100%', maxWidth: 340, padding: '0 20px' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text0, letterSpacing: '-0.01em' }}>Ticketera</div>
            <div style={{ fontSize: 9, color: C.text2, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Equilybrio Group</div>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: C.bg1,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '24px 24px 20px',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, color: C.text0, marginBottom: 2 }}>Iniciar sesión</div>
          <div style={{ fontSize: 11, color: C.text2, marginBottom: 20 }}>Accedé al panel de soporte</div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Correo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="usuario@equilybrio.com"
                autoComplete="email"
                autoFocus
                style={{
                  ...iS,
                  width: '100%',
                  borderColor: error ? 'var(--red)' : 'var(--border)',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { if (!error) e.target.style.borderColor = 'var(--accent)'; }}
                onBlur={(e)  => { if (!error) e.target.style.borderColor = 'var(--border)'; }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  ...iS,
                  width: '100%',
                  borderColor: error ? 'var(--red)' : 'var(--border)',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { if (!error) e.target.style.borderColor = 'var(--accent)'; }}
                onBlur={(e)  => { if (!error) e.target.style.borderColor = 'var(--border)'; }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ fontSize: 11, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              style={{
                marginTop: 4,
                width: '100%',
                padding: '7px 0',
                borderRadius: 4,
                border: 'none',
                background: loading || !email || !password ? C.bg3 : 'var(--accent)',
                color: loading || !email || !password ? C.text2 : '#fff',
                fontSize: 12,
                fontWeight: 500,
                cursor: loading || !email || !password ? 'default' : 'pointer',
                transition: 'background 0.15s, color 0.15s',
                letterSpacing: '0.01em',
              }}
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: C.text2 }}>Acceso restringido · Solo personal autorizado</span>
          <ThemeToggle theme={theme} toggle={toggleTheme} />
        </div>
      </div>
    </div>
  );
}
