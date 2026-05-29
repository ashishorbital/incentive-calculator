/* ─────────────────────────────────────────────────────────────────────────────
   Toyota Design System — ui.jsx
   Drop-in replacement. All original exports preserved so zero changes needed
   in any page file that imports from this.
───────────────────────────────────────────────────────────────────────────── */

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --red:        #e10a1d;
    --red-hover:  #ff1a2e;
    --black:      #000000;
    --charcoal:   #212529;
    --white:      #ffffff;
    --silver:     #dbdbdb;
    --gray:       #787878;
    --bg:         #f4f4f4;
    --surface:    #ffffff;
    --border:     #e8e8e8;
    --font:       'Barlow', sans-serif;
    --radius:     10px;
  }

  body { font-family: var(--font); background: var(--bg); color: var(--charcoal); }
`;

/* inject base CSS once */
if (typeof document !== 'undefined' && !document.getElementById('toyota-ui-base')) {
  const s = document.createElement('style');
  s.id = 'toyota-ui-base';
  s.textContent = BASE_CSS;
  document.head.appendChild(s);
}

/* ── formatCurrency ─────────────────────────────────────────────────────── */
export function formatCurrency(n) {
  if (!n && n !== 0) return '₹0';
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)} L`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);
}

/* ── Button ─────────────────────────────────────────────────────────────── */
const btnBase = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  gap: 6, padding: '9px 18px', fontFamily: 'Barlow, sans-serif',
  fontSize: 13, fontWeight: 700, letterSpacing: '.5px',
  borderRadius: 10, border: 'none', cursor: 'pointer',
  transition: 'all .15s', whiteSpace: 'nowrap', textDecoration: 'none',
};
const btnVariants = {
  primary:   { background: '#e10a1d', color: '#fff' },
  secondary: { background: '#f8f8f8', color: '#212529', border: '1.5px solid #e8e8e8' },
  danger:    { background: '#fff0f1', color: '#e10a1d', border: '1.5px solid rgba(225,10,29,.25)' },
};

export function Button({ children, variant = 'primary', className = '', style, disabled, ...props }) {
  const [hover, setHover] = React.useState(false);
  const hoverStyles = {
    primary:   hover && !disabled ? { background: '#ff1a2e', transform: 'translateY(-1px)', boxShadow: '0 4px 14px rgba(225,10,29,.3)' } : {},
    secondary: hover && !disabled ? { borderColor: '#212529', background: '#f0f0f0' } : {},
    danger:    hover && !disabled ? { background: '#ffe4e6', borderColor: '#e10a1d' } : {},
  };
  return (
    <button
      style={{
        ...btnBase,
        ...btnVariants[variant],
        ...hoverStyles[variant],
        ...(disabled ? { opacity: .5, cursor: 'not-allowed', transform: 'none' } : {}),
        ...style,
      }}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Input ──────────────────────────────────────────────────────────────── */
export function Input({ label, className = '', style, ...props }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#787878' }}>
          {label}
        </span>
      )}
      <input
        style={{
          height: 40, padding: '0 12px',
          fontFamily: 'Barlow, sans-serif', fontSize: 14, color: '#212529',
          background: props.disabled ? '#f4f4f4' : '#f8f8f8',
          border: `1.5px solid ${focus ? '#e10a1d' : '#e8e8e8'}`,
          borderRadius: 10, outline: 'none', width: '100%',
          boxShadow: focus ? '0 0 0 3px rgba(225,10,29,.1)' : 'none',
          transition: 'all .15s',
          cursor: props.disabled ? 'not-allowed' : 'text',
          ...style,
        }}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        {...props}
      />
    </div>
  );
}

/* ── Select ─────────────────────────────────────────────────────────────── */
export function Select({ label, children, className = '', style, ...props }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#787878' }}>
          {label}
        </span>
      )}
      <select
        style={{
          height: 40, padding: '0 36px 0 12px',
          fontFamily: 'Barlow, sans-serif', fontSize: 14, color: '#212529',
          background: `#f8f8f8 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23787878' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 12px center`,
          border: `1.5px solid ${focus ? '#e10a1d' : '#e8e8e8'}`,
          borderRadius: 10, outline: 'none', appearance: 'none', width: '100%',
          boxShadow: focus ? '0 0 0 3px rgba(225,10,29,.1)' : 'none',
          transition: 'all .15s',
          ...style,
        }}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

/* ── Card ───────────────────────────────────────────────────────────────── */
export function Card({ title, children, className = '', style }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10,
      padding: '22px', ...style,
    }}>
      {title && (
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
          color: '#787878', marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ display: 'inline-block', width: 3, height: 13, background: '#e10a1d', borderRadius: 2, flexShrink: 0 }} />
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── StatCard ───────────────────────────────────────────────────────────── */
export function StatCard({ label, value, icon: Icon }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10,
      padding: '18px 20px', borderTop: '3px solid #e10a1d',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {Icon && (
        <div style={{
          width: 36, height: 36, background: '#fff0f1', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e10a1d',
        }}>
          <Icon size={18} strokeWidth={2} />
        </div>
      )}
      <div style={{ fontSize: 28, fontWeight: 800, color: '#000', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#787878' }}>{label}</div>
    </div>
  );
}

/* ── Table ──────────────────────────────────────────────────────────────── */
export function Table({ columns, rows }) {
  if (!rows?.length) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: '#787878', fontSize: 14 }}>
        No records found
      </div>
    );
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{
                textAlign: 'left', fontSize: 11, fontWeight: 700,
                letterSpacing: '1px', textTransform: 'uppercase', color: '#787878',
                padding: '10px 14px', borderBottom: '2px solid #f0f0f0', whiteSpace: 'nowrap',
              }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i} style={{ borderBottom: '1px solid #f8f8f8' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              {columns.map((c) => (
                <td key={c.key} style={{ padding: '12px 14px', color: '#212529', verticalAlign: 'middle' }}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Alert ──────────────────────────────────────────────────────────────── */
export function Alert({ type = 'error', children }) {
  const styles = {
    error:   { background: '#fff0f1', borderColor: '#e10a1d', color: '#a00' },
    success: { background: '#f0faf4', borderColor: '#22c55e', color: '#166534' },
  };
  return (
    <div style={{
      padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
      borderLeft: `4px solid ${styles[type].borderColor}`,
      background: styles[type].background, color: styles[type].color,
    }}>
      {children}
    </div>
  );
}

/* ── need React in scope for hooks ─────────────────────────────────────── */
import React from 'react';
