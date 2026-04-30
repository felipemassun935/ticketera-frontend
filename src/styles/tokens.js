// CSS variable token references — used for inline styles throughout the app
export const C = {
  bg0:        'var(--bg0)',
  bg1:        'var(--bg1)',
  bg2:        'var(--bg2)',
  bg3:        'var(--bg3)',
  border:     'var(--border)',
  borderL:    'var(--borderL)',
  accent:     'var(--accent)',
  accentD:    'var(--accentD)',
  accentL:    'var(--accentL)',
  accentMuted:'var(--accentMuted)',
  green:      'var(--green)',
  amber:      'var(--amber)',
  red:        'var(--red)',
  blue:       'var(--blue)',
  teal:       'var(--teal)',
  text0:      'var(--text0)',
  text1:      'var(--text1)',
  text2:      'var(--text2)',
};

// Shared base input style
export const iS = {
  width:        '100%',
  background:   C.bg0,
  border:       `1px solid ${C.border}`,
  color:        C.text0,
  fontSize:     12,
  padding:      '6px 10px',
  borderRadius: 4,
  outline:      'none',
};
