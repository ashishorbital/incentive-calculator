import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── Inline Toyota Design Tokens ───────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap');

  .login-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Barlow', sans-serif;
    background: #000;
    overflow: hidden;
  }

  /* ── Left panel: brand hero ── */
  .login-hero {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 56px;
    background: #000;
    position: relative;
    overflow: hidden;
  }
  .login-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 40% at 80% 20%, rgba(225,10,29,.18) 0%, transparent 70%),
      radial-gradient(ellipse 50% 60% at 10% 80%, rgba(225,10,29,.08) 0%, transparent 70%);
    pointer-events: none;
  }
  /* Grid texture */
  .login-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  .login-logo {
    display: flex;
    align-items: center;
    gap: 14px;
    position: relative;
    z-index: 1;
  }
  .login-logo-mark {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
  }
  .login-logo-text {
    font-size: 15px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 4px;
    text-transform: uppercase;
  }
  .login-logo-sub {
    font-size: 10px;
    font-weight: 500;
    color: #787878;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 1px;
  }

  .login-hero-body {
    position: relative;
    z-index: 1;
  }
  .login-hero-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #e10a1d;
    margin-bottom: 16px;
  }
  .login-hero-headline {
    font-size: 52px;
    font-weight: 800;
    color: #fff;
    line-height: 1.0;
    letter-spacing: -1px;
    margin-bottom: 20px;
  }
  .login-hero-headline span {
    color: #e10a1d;
  }
  .login-hero-desc {
    font-size: 15px;
    color: #787878;
    line-height: 1.6;
    max-width: 380px;
  }

  .login-hero-footer {
    font-size: 12px;
    color: #444;
    letter-spacing: 1px;
    text-transform: uppercase;
    position: relative;
    z-index: 1;
  }

  /* ── Right panel: form ── */
  .login-form-panel {
    width: 440px;
    flex-shrink: 0;
    background: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 56px 48px;
    position: relative;
  }
  .login-form-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, #e10a1d 0%, transparent 100%);
  }

  .login-form-title {
    font-size: 26px;
    font-weight: 800;
    color: #000;
    margin-bottom: 6px;
    letter-spacing: -.3px;
  }
  .login-form-subtitle {
    font-size: 14px;
    color: #787878;
    margin-bottom: 36px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 18px;
  }
  .form-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #787878;
  }
  .form-input {
    height: 46px;
    padding: 0 14px;
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    color: #212529;
    background: #f8f8f8;
    border: 1.5px solid #e8e8e8;
    border-radius: 10px;
    outline: none;
    transition: all .15s;
  }
  .form-input:focus {
    border-color: #e10a1d;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(225,10,29,.1);
  }

  .login-alert {
    padding: 10px 14px;
    background: #fff0f1;
    border-left: 4px solid #e10a1d;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #a00;
    margin-bottom: 18px;
  }

  .btn-login {
    width: 100%;
    height: 48px;
    background: #e10a1d;
    color: #fff;
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all .15s;
    margin-top: 8px;
  }
  .btn-login:hover:not(:disabled) {
    background: #ff1a2e;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(225,10,29,.35);
  }
  .btn-login:active { transform: translateY(0); }
  .btn-login:disabled { opacity: .6; cursor: not-allowed; }

  .login-demo {
    margin-top: 28px;
    padding: 14px;
    background: #f8f8f8;
    border-radius: 10px;
    font-size: 12px;
    color: #787878;
    line-height: 1.8;
  }
  .login-demo strong { color: #212529; font-weight: 600; }

  /* Responsive */
  @media (max-width: 820px) {
    .login-hero { display: none; }
    .login-form-panel { width: 100%; padding: 40px 32px; }
    .login-form-panel::before { display: none; }
  }
`;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/officer');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="login-root">
        {/* ── Hero ── */}
        <div className="login-hero">
          <div className="login-logo">
            <svg width="44" height="30" viewBox="0 0 44 30" fill="none">
              <ellipse cx="22" cy="15" rx="21" ry="14" stroke="white" strokeWidth="2.5"/>
              <ellipse cx="22" cy="15" rx="21" ry="5" stroke="white" strokeWidth="2.5"/>
              <line x1="1" y1="15" x2="43" y2="15" stroke="black" strokeWidth="4"/>
            </svg>
            <div>
              <div className="login-logo-text">Toyota</div>
              <div className="login-logo-sub">Nippon</div>
            </div>
          </div>

          <div className="login-hero-body">
            <div className="login-hero-eyebrow">Sales Intelligence Platform</div>
            <div className="login-hero-headline">
              Smart<br />
              Incentive<br />
              <span>Calculator</span>
            </div>
            <div className="login-hero-desc">
              Real-time incentive tracking, slab management, and performance analytics for Toyota sales officers.
            </div>
          </div>

          <div className="login-hero-footer">
            © {new Date().getFullYear()} Toyota · Nippon Division
          </div>
        </div>

        {/* ── Form ── */}
        <div className="login-form-panel">
          <div className="login-form-title">Welcome back</div>
          <div className="login-form-subtitle">Sign in to your account to continue</div>

          {error && <div className="login-alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
            </div>
            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="login-demo">
            <strong>Demo credentials</strong><br />
            Admin: <strong>admin@incentive.com</strong> / <strong>Admin@123</strong>
          </div>
        </div>
      </div>
    </>
  );
}
