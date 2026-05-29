import { useEffect, useState } from 'react';
import { Plus, XCircle } from 'lucide-react';
import { api } from '../../lib/api';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap');
  .ms { font-family:'Barlow',sans-serif; display:flex; flex-direction:column; gap:20px; }

  .ms-header { display:flex; align-items:center; gap:12px; }
  .ms-header::before { content:''; display:block; width:4px; height:26px; background:#e10a1d; border-radius:2px; }
  .ms-header h2 { font-size:22px; font-weight:800; color:#000; margin:0; }

  .ms-card { background:#fff; border:1px solid #e8e8e8; border-radius:10px; padding:22px; }
  .ms-card-title { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#787878; margin-bottom:18px; display:flex; align-items:center; gap:8px; }
  .ms-card-title::before { content:''; display:inline-block; width:3px; height:13px; background:#e10a1d; border-radius:2px; }

  .ms-form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:14px; }
  .ms-form-grid .span-all { grid-column:1/-1; }

  .fg { display:flex; flex-direction:column; gap:6px; }
  .fl { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; }
  .fi {
    height:40px; padding:0 12px; font-family:'Barlow',sans-serif; font-size:14px;
    color:#212529; background:#f8f8f8; border:1.5px solid #e8e8e8;
    border-radius:10px; outline:none; transition:all .15s; width:100%;
  }
  .fi:focus { border-color:#e10a1d; background:#fff; box-shadow:0 0 0 3px rgba(225,10,29,.1); }

  .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:9px 18px; font-family:'Barlow',sans-serif; font-size:13px; font-weight:700; letter-spacing:.5px; border-radius:10px; border:none; cursor:pointer; transition:all .15s; }
  .btn-primary { background:#e10a1d; color:#fff; }
  .btn-primary:hover { background:#ff1a2e; transform:translateY(-1px); box-shadow:0 4px 14px rgba(225,10,29,.3); }
  .btn-danger { background:#fff0f1; color:#e10a1d; border:1.5px solid rgba(225,10,29,.2); }
  .btn-danger:hover { background:#ffe4e6; border-color:#e10a1d; }
  .btn-sm { padding:5px 12px; font-size:12px; }

  .alert-error { padding:10px 16px; background:#fff0f1; border-left:4px solid #e10a1d; border-radius:8px; font-size:13px; font-weight:500; color:#a00; }

  /* Slab visual cards */
  .ms-slabs-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:12px; margin-bottom:20px; }
  .ms-slab-card {
    border:1.5px solid #e8e8e8; border-radius:10px; padding:16px 18px;
    display:flex; flex-direction:column; gap:8px; position:relative; overflow:hidden;
    transition:box-shadow .15s;
  }
  .ms-slab-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:#e10a1d; }
  .ms-slab-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.08); }
  .ms-slab-card.inactive { opacity:.5; }
  .ms-slab-card.inactive::before { background:#dbdbdb; }
  .ms-slab-range { font-size:22px; font-weight:800; color:#000; }
  .ms-slab-unit { font-size:11px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:#787878; }
  .ms-slab-incentive { font-size:15px; font-weight:700; color:#e10a1d; }
  .ms-slab-date { font-size:11px; color:#787878; }
  .ms-slab-footer { display:flex; align-items:center; justify-content:space-between; margin-top:4px; }

  .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; }
  .badge-active { background:#ecfdf5; color:#059669; }
  .badge-inactive { background:#f4f4f4; color:#787878; }

  /* Table fallback */
  .ms-table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  thead th { text-align:left; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; padding:10px 14px; border-bottom:2px solid #f0f0f0; }
  tbody tr { border-bottom:1px solid #f8f8f8; }
  tbody tr:hover { background:#fafafa; }
  tbody td { padding:12px 14px; color:#212529; vertical-align:middle; }

  .ms-hint { font-size:12px; color:#787878; margin-top:12px; padding:10px 14px; background:#f8f8f8; border-radius:8px; border-left:3px solid #dbdbdb; }

  .spin { width:16px; height:16px; border:2px solid #dbdbdb; border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
`;

export default function ManageSlabs() {
  const [slabs, setSlabs] = useState([]);
  const [form, setForm] = useState({
    min_units: 1,
    max_units: '',
    incentive_per_car: 1000,
    effective_date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api('/slabs').then(setSlabs).catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api('/slabs', {
        method: 'POST',
        body: JSON.stringify({
          min_units: Number(form.min_units),
          max_units: form.max_units === '' ? null : Number(form.max_units),
          incentive_per_car: Number(form.incentive_per_car),
          effective_date: form.effective_date,
        }),
      });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id) => {
    await api(`/slabs/${id}`, { method: 'DELETE' });
    load();
  };

  const rangeLabel = (s) => `${s.min_units} – ${s.max_units ?? '∞'}`;

  return (
    <>
      <style>{css}</style>
      <div className="ms">

        <div className="ms-header"><h2>Incentive Slabs</h2></div>

        {error && <div className="alert-error">{error}</div>}

        {/* Add form */}
        <div className="ms-card">
          <div className="ms-card-title">Add New Slab</div>
          <form onSubmit={handleCreate}>
            <div className="ms-form-grid">
              <div className="fg">
                <label className="fl">Min Units</label>
                <input className="fi" type="number" min={0} value={form.min_units}
                  onChange={(e) => setForm({ ...form, min_units: e.target.value })} />
              </div>
              <div className="fg">
                <label className="fl">Max Units <span style={{fontWeight:400,textTransform:'none',letterSpacing:0}}>(empty = ∞)</span></label>
                <input className="fi" type="number" value={form.max_units}
                  onChange={(e) => setForm({ ...form, max_units: e.target.value })}
                  placeholder="Unlimited" />
              </div>
              <div className="fg">
                <label className="fl">Incentive / Car (₹)</label>
                <input className="fi" type="number" min={1} value={form.incentive_per_car}
                  onChange={(e) => setForm({ ...form, incentive_per_car: e.target.value })} />
              </div>
              <div className="fg">
                <label className="fl">Effective Date</label>
                <input className="fi" type="date" value={form.effective_date}
                  onChange={(e) => setForm({ ...form, effective_date: e.target.value })} />
              </div>
              <div className="span-all">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? <span className="spin" /> : <Plus size={15} />}
                  {saving ? 'Saving…' : 'Add Slab'}
                </button>
              </div>
            </div>
          </form>
          <div className="ms-hint">
            Example: 1–3 cars → ₹1,000 · 4–7 cars → ₹2,000 · 8+ cars → ₹3,500 (leave max empty for unlimited)
          </div>
        </div>

        {/* Active slabs visual */}
        <div className="ms-card">
          <div className="ms-card-title">Active Slabs</div>
          {slabs.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#787878', padding: '32px 0', fontSize: 14 }}>
              No slabs configured yet
            </div>
          ) : (
            <div className="ms-slabs-grid">
              {slabs.map((s) => (
                <div key={s.id} className={`ms-slab-card ${s.status !== 'active' ? 'inactive' : ''}`}>
                  <div className="ms-slab-unit">Units</div>
                  <div className="ms-slab-range">{rangeLabel(s)}</div>
                  <div className="ms-slab-incentive">₹{Number(s.incentive_per_car).toLocaleString('en-IN')} per car</div>
                  <div className="ms-slab-date">Effective: {s.effective_date}</div>
                  <div className="ms-slab-footer">
                    <span className={`badge badge-${s.status}`}>{s.status}</span>
                    {s.status === 'active' && (
                      <button className="btn btn-danger btn-sm" onClick={() => deactivate(s.id)}>
                        <XCircle size={13} /> Deactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
