import { useState } from 'react';
import { Calculator as CalcIcon, Zap } from 'lucide-react';
import { api } from '../../lib/api';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap');
  .calc { font-family:'Barlow',sans-serif; display:flex; flex-direction:column; gap:20px; max-width:720px; }

  .calc-header { display:flex; align-items:center; gap:12px; }
  .calc-header::before { content:''; display:block; width:4px; height:26px; background:#e10a1d; border-radius:2px; }
  .calc-header h2 { font-size:22px; font-weight:800; color:#000; margin:0; }

  .calc-card { background:#fff; border:1px solid #e8e8e8; border-radius:10px; padding:24px; }
  .calc-card-title { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#787878; margin-bottom:18px; display:flex; align-items:center; gap:8px; }
  .calc-card-title::before { content:''; display:inline-block; width:3px; height:13px; background:#e10a1d; border-radius:2px; }

  .fg { display:flex; flex-direction:column; gap:6px; }
  .fl { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; }
  .fi {
    height:40px; padding:0 12px; font-family:'Barlow',sans-serif; font-size:14px;
    color:#212529; background:#f8f8f8; border:1.5px solid #e8e8e8;
    border-radius:10px; outline:none; transition:all .15s;
  }
  .fi:focus { border-color:#e10a1d; background:#fff; box-shadow:0 0 0 3px rgba(225,10,29,.1); }

  .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:10px 22px; font-family:'Barlow',sans-serif; font-size:14px; font-weight:700; letter-spacing:.5px; border-radius:10px; border:none; cursor:pointer; transition:all .15s; }
  .btn-primary { background:#e10a1d; color:#fff; }
  .btn-primary:hover { background:#ff1a2e; transform:translateY(-1px); box-shadow:0 4px 16px rgba(225,10,29,.35); }
  .btn-primary:active { transform:none; }

  .calc-input-row { display:flex; align-items:flex-end; gap:12px; }
  .calc-input-row .fg { flex:1; }

  /* Result panel */
  .calc-result {
    display:grid; grid-template-columns:1fr 1fr; gap:12px;
  }
  .calc-metric {
    border-radius:10px; padding:20px 22px;
    display:flex; flex-direction:column; gap:6px;
  }
  .calc-metric.dark { background:#000; }
  .calc-metric.light { background:#f8f8f8; border:1.5px solid #f0f0f0; }
  .calc-metric-label { font-size:11px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; }
  .calc-metric.dark .calc-metric-label { color:#787878; }
  .calc-metric.light .calc-metric-label { color:#787878; }
  .calc-metric-val { font-size:32px; font-weight:800; line-height:1; }
  .calc-metric.dark .calc-metric-val { color:#e10a1d; }
  .calc-metric.light .calc-metric-val { color:#000; }

  /* Detail rows */
  .calc-details { display:flex; flex-direction:column; gap:0; margin-top:4px; }
  .calc-detail-row {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 0; border-bottom:1px solid #f0f0f0; font-size:14px;
  }
  .calc-detail-row:last-child { border-bottom:none; }
  .calc-detail-label { color:#787878; }
  .calc-detail-val { font-weight:700; color:#000; }

  /* Formula box */
  .calc-formula {
    background:#f8f8f8; border-radius:10px; padding:14px 16px;
    font-family: 'Courier New', monospace; font-size:14px; color:#212529;
    line-height:1.6; border-left:3px solid #e10a1d; margin-top:4px;
  }

  .calc-slab-badge {
    display:inline-block; padding:4px 14px; border-radius:20px;
    background:#fff0f1; color:#e10a1d; font-size:12px; font-weight:700;
  }

  .spin { width:16px; height:16px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }

  @media (max-width:520px) { .calc-result { grid-template-columns:1fr; } }
`;

function formatCurrency(v) {
  if (!v && v !== 0) return '₹0';
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(2)} Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)} L`;
  return `₹${Number(v).toLocaleString('en-IN')}`;
}

export default function Calculator() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const data = await api(`/sales/preview?month=${month}-01`);
      setPreview(data);
    } finally {
      setLoading(false);
    }
  };

  const slab = preview?.slab;

  return (
    <>
      <style>{css}</style>
      <div className="calc">

        <div className="calc-header"><h2>Incentive Calculator</h2></div>

        {/* Input */}
        <div className="calc-card">
          <div className="calc-card-title">Select Month</div>
          <div className="calc-input-row">
            <div className="fg">
              <label className="fl">Month</label>
              <input className="fi" type="month" value={month}
                onChange={(e) => setMonth(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={calculate} disabled={loading}>
              {loading ? <span className="spin" /> : <Zap size={16} />}
              {loading ? 'Calculating…' : 'Calculate'}
            </button>
          </div>
        </div>

        {/* Results */}
        {preview && (
          <div className="calc-card">
            <div className="calc-card-title">Calculation Result</div>

            <div className="calc-result">
              <div className="calc-metric dark">
                <div className="calc-metric-label">Total Incentive</div>
                <div className="calc-metric-val">{formatCurrency(preview.total_incentive)}</div>
              </div>
              <div className="calc-metric light">
                <div className="calc-metric-label">Cars Sold</div>
                <div className="calc-metric-val">{preview.total_sales}</div>
              </div>
            </div>

            <div className="calc-details">
              <div className="calc-detail-row">
                <span className="calc-detail-label">Slab matched</span>
                <span className="calc-detail-val">
                  {slab
                    ? <span className="calc-slab-badge">{slab.min_units}–{slab.max_units ?? '∞'} cars</span>
                    : <span style={{ color: '#787878', fontWeight: 400 }}>None matched</span>}
                </span>
              </div>
              <div className="calc-detail-row">
                <span className="calc-detail-label">Incentive per car</span>
                <span className="calc-detail-val">{formatCurrency(preview.incentive_per_car)}</span>
              </div>
            </div>

            <div className="calc-formula">
              {preview.total_sales} cars × {formatCurrency(preview.incentive_per_car)} = <strong>{formatCurrency(preview.total_incentive)}</strong>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
