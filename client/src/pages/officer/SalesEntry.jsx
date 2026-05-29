import { useEffect, useState } from 'react';
import { Plus, Trash2, Send, Car } from 'lucide-react';
import { api } from '../../lib/api';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap');
  .se { font-family:'Barlow',sans-serif; display:flex; flex-direction:column; gap:20px; }

  .se-header { display:flex; align-items:center; gap:12px; }
  .se-header::before { content:''; display:block; width:4px; height:26px; background:#e10a1d; border-radius:2px; }
  .se-header h2 { font-size:22px; font-weight:800; color:#000; margin:0; }

  .se-card { background:#fff; border:1px solid #e8e8e8; border-radius:10px; padding:22px; }
  .se-card-title { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#787878; margin-bottom:18px; display:flex; align-items:center; gap:8px; }
  .se-card-title::before { content:''; display:inline-block; width:3px; height:13px; background:#e10a1d; border-radius:2px; }

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
  .btn-secondary:hover { border-color:#212529; }
  .btn-danger { background:#fff0f1; color:#e10a1d; border:1.5px solid rgba(225,10,29,.2); }
  .btn-danger:hover { background:#ffe4e6; border-color:#e10a1d; }
  .btn-sm { padding:5px 12px; font-size:12px; }
  .btn-full { width:100%; height:46px; font-size:14px; }

  .alert-error   { padding:10px 16px; background:#fff0f1; border-left:4px solid #e10a1d; border-radius:8px; font-size:13px; font-weight:500; color:#a00; }
  .alert-success { padding:10px 16px; background:#f0faf4; border-left:4px solid #22c55e; border-radius:8px; font-size:13px; font-weight:500; color:#166534; }

  /* Two-col layout */
  .se-layout { display:grid; grid-template-columns:1fr 300px; gap:16px; }
  @media (max-width:860px) { .se-layout { grid-template-columns:1fr; } }

  /* Entry form grid */
  .se-form-grid { display:grid; grid-template-columns:1fr 120px auto; gap:12px; align-items:flex-end; }
  @media (max-width:600px) { .se-form-grid { grid-template-columns:1fr; } }

  /* Live preview card */
  .se-preview {
    background:#000; border-radius:10px; padding:22px;
    display:flex; flex-direction:column; gap:14px; position:sticky; top:20px;
  }
  .se-preview-title { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#e10a1d; }
  .se-preview-row { display:flex; align-items:center; justify-content:space-between; }
  .se-preview-label { font-size:13px; color:#787878; }
  .se-preview-val { font-size:14px; font-weight:600; color:#fff; text-align:right; }
  .se-preview-divider { height:1px; background:rgba(255,255,255,.08); }
  .se-preview-total-label { font-size:13px; font-weight:600; color:#787878; }
  .se-preview-total-val { font-size:24px; font-weight:800; color:#e10a1d; }
  .se-preview-formula { font-size:11px; color:#444; font-family:monospace; padding:10px 12px; background:rgba(255,255,255,.04); border-radius:8px; line-height:1.6; }

  /* Entries table */
  .se-table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  thead th { text-align:left; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; padding:10px 14px; border-bottom:2px solid #f0f0f0; }
  tbody tr { border-bottom:1px solid #f8f8f8; transition:background .1s; }
  tbody tr:hover { background:#fafafa; }
  tbody td { padding:11px 14px; color:#212529; vertical-align:middle; }
  tbody tr:last-child { border-bottom:none; }

  .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; }
  .badge-draft { background:#fffbeb; color:#b45309; }
  .badge-submitted { background:#eff6ff; color:#1d4ed8; }

  .se-submit-section { border-top:1px solid #f0f0f0; padding-top:16px; margin-top:4px; }
  .se-submit-hint { font-size:12px; color:#787878; margin-top:8px; }

  .se-empty { padding:32px; text-align:center; color:#787878; font-size:14px; display:flex; flex-direction:column; align-items:center; gap:10px; }

  .spin { width:16px; height:16px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
`;

function formatCurrency(v) {
  if (!v && v !== 0) return '₹0';
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(2)} Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)} L`;
  return `₹${Number(v).toLocaleString('en-IN')}`;
}

export default function SalesEntry() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [cars, setCars] = useState([]);
  const [entries, setEntries] = useState([]);
  const [modelId, setModelId] = useState('');
  const [units, setUnits] = useState(1);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const monthParam = `${month}-01`;

  const load = async () => {
    const [carList, sales] = await Promise.all([
      api('/cars/active'),
      api(`/sales?month=${monthParam}`),
    ]);
    setCars(carList.filter?.((c) => c.status === 'active') || carList);
    setEntries(sales);
    const p = await api(`/sales/preview?month=${monthParam}`);
    setPreview(p);
  };

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [month]);

  const addEntry = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      await api('/sales', {
        method: 'POST',
        body: JSON.stringify({ month: monthParam, model_id: modelId, units_sold: Number(units) }),
      });
      setModelId(''); setUnits(1);
      load();
      setSuccess('Entry saved as draft');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const submitAll = async () => {
    setError(''); setSubmitting(true);
    try {
      const result = await api('/sales/submit', {
        method: 'POST',
        body: JSON.stringify({ month: monthParam }),
      });
      setSuccess(`Submitted! Total incentive: ${formatCurrency(result.breakdown.total_incentive)}`);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEntry = async (id) => {
    await api(`/sales/${id}`, { method: 'DELETE' });
    load();
  };

  const slabLabel = preview?.slab
    ? `${preview.slab.min_units}–${preview.slab.max_units ?? '∞'} @ ₹${preview.slab.incentive_per_car}/car`
    : 'No slab matched';

  return (
    <>
      <style>{css}</style>
      <div className="se">

        <div className="se-header"><h2>Monthly Sales Entry</h2></div>

        {error   && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        <div className="se-layout">
          {/* Left: form + table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Month picker + add form */}
            <div className="se-card">
              <div className="se-card-title">Add Entry</div>
              <div style={{ marginBottom: 14 }}>
                <div className="fg">
                  <label className="fl">Month</label>
                  <input className="fi" type="month" value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    style={{ maxWidth: 200 }} />
                </div>
              </div>
              <form onSubmit={addEntry}>
                <div className="se-form-grid">
                  <div className="fg">
                    <label className="fl">Car Model</label>
                    <select className="fs" value={modelId}
                      onChange={(e) => setModelId(e.target.value)} required>
                      <option value="">Select model</option>
                      {cars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.model_name} {c.variant}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="fg">
                    <label className="fl">Units Sold</label>
                    <input className="fi" type="number" min={1} value={units}
                      onChange={(e) => setUnits(e.target.value)} />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={saving}
                    style={{ height: 40, alignSelf: 'flex-end' }}>
                    {saving ? <span className="spin" /> : <Plus size={15} />}
                    {saving ? '' : 'Save Draft'}
                  </button>
                </div>
              </form>
            </div>

            {/* Entries table */}
            <div className="se-card">
              <div className="se-card-title">Your Entries</div>
              <div className="se-table-wrap">
                {entries.length === 0 ? (
                  <div className="se-empty">
                    <Car size={32} style={{ color: '#dbdbdb' }} />
                    <span>No entries yet — add your first sale above</span>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Model</th>
                        <th>Units</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600 }}>{r.car_models?.model_name || '—'}</td>
                          <td style={{ fontWeight: 700 }}>{r.units_sold}</td>
                          <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            {r.status === 'draft' ? (
                              <button className="btn btn-danger btn-sm" onClick={() => deleteEntry(r.id)}>
                                <Trash2 size={13} /> Remove
                              </button>
                            ) : (
                              <span style={{ fontSize: 12, color: '#787878' }}>Locked</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {entries.length > 0 && (
                <div className="se-submit-section">
                  <button className="btn btn-primary btn-full" onClick={submitAll} disabled={submitting}>
                    {submitting ? <span className="spin" /> : <Send size={15} />}
                    {submitting ? 'Submitting…' : 'Final Submit'}
                  </button>
                  <div className="se-submit-hint">
                    Submitting locks all draft entries and calculates your final incentive.
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right: live preview */}
          <div className="se-preview">
            <div className="se-preview-title">Live Preview</div>

            <div className="se-preview-row">
              <span className="se-preview-label">Cars sold</span>
              <span className="se-preview-val" style={{ fontSize: 22, fontWeight: 800 }}>
                {preview?.total_sales ?? 0}
              </span>
            </div>

            <div className="se-preview-divider" />

            <div className="se-preview-row">
              <span className="se-preview-label">Slab matched</span>
              <span className="se-preview-val" style={{ fontSize: 12 }}>{slabLabel}</span>
            </div>

            <div className="se-preview-row">
              <span className="se-preview-label">Per car</span>
              <span className="se-preview-val">{formatCurrency(preview?.incentive_per_car)}</span>
            </div>

            <div className="se-preview-divider" />

            <div className="se-preview-row">
              <span className="se-preview-total-label">Total incentive</span>
              <span className="se-preview-total-val">{formatCurrency(preview?.total_incentive)}</span>
            </div>

            {preview?.total_sales > 0 && (
              <div className="se-preview-formula">
                {preview.total_sales} cars × {formatCurrency(preview.incentive_per_car)}
                {'\n'}= {formatCurrency(preview.total_incentive)}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
