import { useEffect, useState } from 'react';
import { Plus, Trash2, Shield, User } from 'lucide-react';
import { api } from '../../lib/api';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap');
  .mu { font-family:'Barlow',sans-serif; display:flex; flex-direction:column; gap:20px; }

  .mu-header { display:flex; align-items:center; gap:12px; }
  .mu-header::before { content:''; display:block; width:4px; height:26px; background:#e10a1d; border-radius:2px; }
  .mu-header h2 { font-size:22px; font-weight:800; color:#000; margin:0; }

  .mu-card { background:#fff; border:1px solid #e8e8e8; border-radius:10px; padding:22px; }
  .mu-card-title { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#787878; margin-bottom:18px; display:flex; align-items:center; gap:8px; }
  .mu-card-title::before { content:''; display:inline-block; width:3px; height:13px; background:#e10a1d; border-radius:2px; }

  .mu-form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px; }
  .mu-form-grid .span-all { grid-column:1/-1; }

  .fg { display:flex; flex-direction:column; gap:6px; }
  .fl { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; }
  .fi, .fs {
    height:40px; padding:0 12px; font-family:'Barlow',sans-serif; font-size:14px;
    color:#212529; background:#f8f8f8; border:1.5px solid #e8e8e8;
    border-radius:10px; outline:none; transition:all .15s; width:100%;
  }
  .fi:focus, .fs:focus { border-color:#e10a1d; background:#fff; box-shadow:0 0 0 3px rgba(225,10,29,.1); }
  .fs { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23787878' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; background-color:#f8f8f8; padding-right:36px; }

  .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:9px 18px; font-family:'Barlow',sans-serif; font-size:13px; font-weight:700; letter-spacing:.5px; border-radius:10px; border:none; cursor:pointer; transition:all .15s; }
  .btn-primary { background:#e10a1d; color:#fff; }
  .btn-primary:hover { background:#ff1a2e; transform:translateY(-1px); box-shadow:0 4px 14px rgba(225,10,29,.3); }
  .btn-danger { background:#fff0f1; color:#e10a1d; border:1.5px solid rgba(225,10,29,.2); }
  .btn-danger:hover { background:#ffe4e6; border-color:#e10a1d; }
  .btn-sm { padding:5px 12px; font-size:12px; }

  .alert-error { padding:10px 16px; background:#fff0f1; border-left:4px solid #e10a1d; border-radius:8px; font-size:13px; font-weight:500; color:#a00; }

  /* User table */
  .mu-table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  thead th { text-align:left; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; padding:10px 14px; border-bottom:2px solid #f0f0f0; white-space:nowrap; }
  tbody tr { border-bottom:1px solid #f8f8f8; transition:background .1s; }
  tbody tr:hover { background:#fafafa; }
  tbody td { padding:12px 14px; color:#212529; vertical-align:middle; }
  tbody tr:last-child { border-bottom:none; }

  /* Avatar */
  .mu-avatar {
    width:34px; height:34px; border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:13px; font-weight:800; flex-shrink:0;
    text-transform:uppercase; letter-spacing:.5px;
  }
  .mu-avatar.admin { background:#fff0f1; color:#e10a1d; }
  .mu-avatar.officer { background:#f0f4ff; color:#2563eb; }

  .mu-user-cell { display:flex; align-items:center; gap:10px; }
  .mu-user-name { font-weight:600; color:#000; font-size:14px; }
  .mu-user-email { font-size:12px; color:#787878; }

  .badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; }
  .badge-admin { background:#fff0f1; color:#e10a1d; }
  .badge-officer { background:#eff6ff; color:#1d4ed8; }

  .mu-empty { padding:40px; text-align:center; color:#787878; font-size:14px; }

  .spin { width:16px; height:16px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
`;

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'sales_officer' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api('/users').then(setUsers).catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api('/users', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', email: '', password: '', role: 'sales_officer' });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api(`/users/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="mu">

        <div className="mu-header"><h2>Sales Officers &amp; Users</h2></div>

        {error && <div className="alert-error">{error}</div>}

        {/* Add user form */}
        <div className="mu-card">
          <div className="mu-card-title">Add New User</div>
          <form onSubmit={handleCreate}>
            <div className="mu-form-grid">
              <div className="fg">
                <label className="fl">Full Name</label>
                <input className="fi" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Arjun Mehta" required />
              </div>
              <div className="fg">
                <label className="fl">Email</label>
                <input className="fi" type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="arjun@toyota.com" required />
              </div>
              <div className="fg">
                <label className="fl">Password</label>
                <input className="fi" type="password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters" required />
              </div>
              <div className="fg">
                <label className="fl">Role</label>
                <select className="fs" value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="sales_officer">Sales Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="span-all">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? <span className="spin" /> : <Plus size={15} />}
                  {saving ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Users table */}
        <div className="mu-card">
          <div className="mu-card-title">All Users ({users.length})</div>
          <div className="mu-table-wrap">
            {users.length === 0 ? (
              <div className="mu-empty">No users found</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isAdmin = u.role === 'admin';
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="mu-user-cell">
                            <div className={`mu-avatar ${isAdmin ? 'admin' : 'officer'}`}>
                              {getInitials(u.name)}
                            </div>
                            <div>
                              <div className="mu-user-name">{u.name}</div>
                              <div className="mu-user-email">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${isAdmin ? 'admin' : 'officer'}`}>
                            {isAdmin ? <Shield size={11} /> : <User size={11} />}
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>
                            <Trash2 size={13} /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
