import { useState } from 'react';
import { Save, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap');
  .pr { font-family:'Barlow',sans-serif; display:flex; flex-direction:column; gap:20px; max-width:640px; }

  .pr-header { display:flex; align-items:center; gap:12px; }
  .pr-header::before { content:''; display:block; width:4px; height:26px; background:#e10a1d; border-radius:2px; }
  .pr-header h2 { font-size:22px; font-weight:800; color:#000; margin:0; }

  .pr-card { background:#fff; border:1px solid #e8e8e8; border-radius:10px; padding:24px; }
  .pr-card-title { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#787878; margin-bottom:20px; display:flex; align-items:center; gap:8px; }
  .pr-card-title::before { content:''; display:inline-block; width:3px; height:13px; background:#e10a1d; border-radius:2px; }

  /* Avatar */
  .pr-avatar-row { display:flex; align-items:center; gap:18px; margin-bottom:24px; padding-bottom:24px; border-bottom:1px solid #f0f0f0; }
  .pr-avatar {
    width:64px; height:64px; border-radius:12px; background:#000;
    display:flex; align-items:center; justify-content:center;
    font-size:22px; font-weight:800; color:#fff; letter-spacing:.5px; flex-shrink:0;
    position:relative; overflow:hidden;
  }
  .pr-avatar::after {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse at 30% 20%, rgba(225,10,29,.4) 0%, transparent 70%);
  }
  .pr-avatar-letter { position:relative; z-index:1; }
  .pr-avatar-name { font-size:18px; font-weight:800; color:#000; }
  .pr-avatar-email { font-size:13px; color:#787878; margin-top:2px; }
  .pr-avatar-role {
    display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px;
    font-weight:700; letter-spacing:.5px; text-transform:uppercase; margin-top:6px;
    background:#fff0f1; color:#e10a1d;
  }

  .fg { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
  .fl { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; }
  .fi {
    height:44px; padding:0 14px; font-family:'Barlow',sans-serif; font-size:14px;
    color:#212529; background:#f8f8f8; border:1.5px solid #e8e8e8;
    border-radius:10px; outline:none; transition:all .15s; width:100%;
  }
  .fi:focus { border-color:#e10a1d; background:#fff; box-shadow:0 0 0 3px rgba(225,10,29,.1); }
  .fi:disabled { opacity:.6; cursor:not-allowed; color:#787878; }

  .fi-icon-wrap { position:relative; }
  .fi-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#787878; pointer-events:none; }
  .fi-icon-wrap .fi { padding-left:38px; }

  .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 24px; font-family:'Barlow',sans-serif; font-size:14px; font-weight:700; letter-spacing:.5px; border-radius:10px; border:none; cursor:pointer; transition:all .15s; }
  .btn-primary { background:#e10a1d; color:#fff; }
  .btn-primary:hover { background:#ff1a2e; transform:translateY(-1px); box-shadow:0 4px 16px rgba(225,10,29,.35); }
  .btn-primary:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  .alert-error   { padding:12px 16px; background:#fff0f1; border-left:4px solid #e10a1d; border-radius:10px; font-size:13px; font-weight:500; color:#a00; }
  .alert-success { padding:12px 16px; background:#f0faf4; border-left:4px solid #22c55e; border-radius:10px; font-size:13px; font-weight:500; color:#166534; }

  .pr-section-label {
    font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;
    color:#787878; margin-bottom:14px; margin-top:4px;
    display:flex; align-items:center; gap:8px;
  }
  .pr-section-label::before { content:''; display:inline-block; width:3px; height:13px; background:#dbdbdb; border-radius:2px; }
  .pr-divider { height:1px; background:#f0f0f0; margin:20px 0; }

  .pr-hint { font-size:12px; color:#787878; margin-top:-10px; margin-bottom:16px; }

  .spin { width:16px; height:16px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
`;

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function Profile() {
  const { user } = useAuth();
  const [name, setName]         = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [message, setMessage]   = useState('');
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    setSaving(true);
    try {
      const body = { name };
      if (password) body.password = password;
      await api('/profile', { method: 'PATCH', body: JSON.stringify(body) });
      setMessage('Profile updated successfully');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="pr">

        <div className="pr-header"><h2>Profile</h2></div>

        {error   && <div className="alert-error">{error}</div>}
        {message && <div className="alert-success">{message}</div>}

        <div className="pr-card">
          <div className="pr-card-title">Your Details</div>

          {/* Avatar row */}
          <div className="pr-avatar-row">
            <div className="pr-avatar">
              <span className="pr-avatar-letter">{getInitials(user?.name)}</span>
            </div>
            <div>
              <div className="pr-avatar-name">{user?.name || 'User'}</div>
              <div className="pr-avatar-email">{user?.email}</div>
              <div className="pr-avatar-role">{(user?.role || '').replace('_', ' ')}</div>
            </div>
          </div>

          <form onSubmit={handleSave}>
            {/* Identity */}
            <div className="pr-section-label">
              <User size={13} /> Identity
            </div>

            <div className="fg">
              <label className="fl">Email Address</label>
              <div className="fi-icon-wrap">
                <input className="fi" value={user?.email || ''} disabled />
              </div>
            </div>

            <div className="fg">
              <label className="fl">Display Name</label>
              <input className="fi" value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name" />
            </div>

            <div className="pr-divider" />

            {/* Password */}
            <div className="pr-section-label">
              <Lock size={13} /> Change Password
            </div>
            <div className="fg">
              <label className="fl">New Password</label>
              <input className="fi" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password" />
            </div>
            <div className="pr-hint">Minimum 6 characters</div>

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? <span className="spin" /> : <Save size={15} />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

      </div>
    </>
  );
}
