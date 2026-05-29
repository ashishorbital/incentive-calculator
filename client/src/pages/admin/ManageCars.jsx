import { useEffect, useState } from 'react';
import { Plus, Search, RefreshCw, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../../lib/api';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap');
  .mc { font-family:'Barlow',sans-serif; display:flex; flex-direction:column; gap:20px; }

  .mc-header { display:flex; align-items:center; justify-content:space-between; }
  .mc-header-left { display:flex; align-items:center; gap:12px; }
  .mc-header-left::before {
    content:''; display:block; width:4px; height:26px;
    background:#e10a1d; border-radius:2px;
  }
  .mc-header-left h2 { font-size:22px; font-weight:800; color:#000; margin:0; }

  .mc-card { background:#fff; border:1px solid #e8e8e8; border-radius:10px; padding:22px; }
  .mc-card-title {
    font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;
    color:#787878; margin-bottom:18px; display:flex; align-items:center; gap:8px;
  }
  .mc-card-title::before { content:''; display:inline-block; width:3px; height:13px; background:#e10a1d; border-radius:2px; }

  .mc-form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:14px; }
  .mc-form-grid .span-all { grid-column:1/-1; }

  .fg { display:flex; flex-direction:column; gap:6px; }
  .fl { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; }
  .fi, .fs {
    height:40px; padding:0 12px; font-family:'Barlow',sans-serif; font-size:14px;
    color:#212529; background:#f8f8f8; border:1.5px solid #e8e8e8;
    border-radius:10px; outline:none; transition:all .15s; width:100%;
  }
  .fi:focus, .fs:focus { border-color:#e10a1d; background:#fff; box-shadow:0 0 0 3px rgba(225,10,29,.1); }
  .fs { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23787878' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; background-color:#f8f8f8; padding-right:36px; }

  .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:9px 18px; font-family:'Barlow',sans-serif; font-size:13px; font-weight:700; letter-spacing:.5px; border-radius:10px; border:none; cursor:pointer; transition:all .15s; white-space:nowrap; }
  .btn-primary { background:#e10a1d; color:#fff; }
  .btn-primary:hover { background:#ff1a2e; transform:translateY(-1px); box-shadow:0 4px 14px rgba(225,10,29,.3); }
  .btn-secondary { background:#f8f8f8; color:#212529; border:1.5px solid #e8e8e8; }
  .btn-secondary:hover { border-color:#212529; background:#f0f0f0; }
  .btn-danger { background:#fff0f1; color:#e10a1d; border:1.5px solid rgba(225,10,29,.2); }
  .btn-danger:hover { background:#ffe4e6; border-color:#e10a1d; }
  .btn-sm { padding:5px 12px; font-size:12px; }

  .mc-search-wrap { position:relative; margin-bottom:16px; }
  .mc-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#787878; pointer-events:none; }
  .mc-search-input {
    width:100%; height:40px; padding:0 12px 0 38px;
    font-family:'Barlow',sans-serif; font-size:14px; color:#212529;
    background:#f8f8f8; border:1.5px solid #e8e8e8; border-radius:10px; outline:none; transition:all .15s;
  }
  .mc-search-input:focus { border-color:#e10a1d; background:#fff; box-shadow:0 0 0 3px rgba(225,10,29,.1); }

  .mc-table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  thead th { text-align:left; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; padding:10px 14px; border-bottom:2px solid #f0f0f0; white-space:nowrap; }
  tbody tr { border-bottom:1px solid #f8f8f8; transition:background .1s; }
  tbody tr:hover { background:#fafafa; }
  tbody td { padding:12px 14px; color:#212529; vertical-align:middle; }
  tbody tr:last-child { border-bottom:none; }

  .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; }
  .badge-active { background:#ecfdf5; color:#059669; }
  .badge-inactive { background:#f4f4f4; color:#787878; }

  .td-actions { display:flex; gap:8px; }

  .alert-error { padding:10px 16px; background:#fff0f1; border-left:4px solid #e10a1d; border-radius:8px; font-size:13px; font-weight:500; color:#a00; }

  .mc-empty { padding:40px; text-align:center; color:#787878; font-size:14px; }

  .spin { width:18px; height:18px; border:2px solid #dbdbdb; border-top-color:#e10a1d; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }
  @keyframes spin { to { transform:rotate(360deg); } }
`;

export default function ManageCars() {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ model_name: '', suffix: '', variant: '', status: 'active' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    api(`/cars${q}`).then(setCars).catch((e) => setError(e.message));
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api('/cars', { method: 'POST', body: JSON.stringify(form) });
      setForm({ model_name: '', suffix: '', variant: '', status: 'active' });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (car) => {
    await api(`/cars/${car.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: car.status === 'active' ? 'inactive' : 'active' }),
    });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this car model?')) return;
    await api(`/cars/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      <style>{css}</style>
      <div className="mc">

        {/* Header */}
        <div className="mc-header">
          <div className="mc-header-left"><h2>Car Inventory</h2></div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {/* Add form */}
        <div className="mc-card">
          <div className="mc-card-title">Add Car Model</div>
          <form onSubmit={handleCreate}>
            <div className="mc-form-grid">
              <div className="fg">
                <label className="fl">Model Name</label>
                <input className="fi" value={form.model_name}
                  onChange={(e) => setForm({ ...form, model_name: e.target.value })}
                  placeholder="e.g. Innova" required />
              </div>
              <div className="fg">
                <label className="fl">Base Suffix</label>
                <input className="fi" value={form.suffix}
                  onChange={(e) => setForm({ ...form, suffix: e.target.value })}
                  placeholder="e.g. Crysta" />
              </div>
              <div className="fg">
                <label className="fl">Variant</label>
                <input className="fi" value={form.variant}
                  onChange={(e) => setForm({ ...form, variant: e.target.value })}
                  placeholder="e.g. GX" />
              </div>
              <div className="fg">
                <label className="fl">Status</label>
                <select className="fs" value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="span-all" style={{ marginTop: 4 }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? <span className="spin" /> : <Plus size={15} />}
                  {saving ? 'Saving…' : 'Add Car Model'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="mc-card">
          <div className="mc-card-title">All Models</div>
          <div className="mc-search-wrap">
            <Search size={15} className="mc-search-icon" />
            <input
              className="mc-search-input"
              placeholder="Search models…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="mc-table-wrap">
            {cars.length === 0 ? (
              <div className="mc-empty">No car models found</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Suffix</th>
                    <th>Variant</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.id}>
                      <td style={{ fontWeight: 600 }}>{car.model_name}</td>
                      <td style={{ color: '#787878' }}>{car.suffix || '—'}</td>
                      <td style={{ color: '#787878' }}>{car.variant || '—'}</td>
                      <td>
                        <span className={`badge badge-${car.status}`}>{car.status}</span>
                      </td>
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => toggleStatus(car)}>
                            {car.status === 'active'
                              ? <><ToggleRight size={13} /> Deactivate</>
                              : <><ToggleLeft size={13} /> Activate</>}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(car.id)}>
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
