import { useState } from 'react';
import { FileText, Download, BarChart2, IndianRupee } from 'lucide-react';
import { api } from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap');
  .rp { font-family:'Barlow',sans-serif; display:flex; flex-direction:column; gap:20px; }

  .rp-header { display:flex; align-items:center; gap:12px; }
  .rp-header::before { content:''; display:block; width:4px; height:26px; background:#e10a1d; border-radius:2px; }
  .rp-header h2 { font-size:22px; font-weight:800; color:#000; margin:0; }

  .rp-card { background:#fff; border:1px solid #e8e8e8; border-radius:10px; padding:22px; }
  .rp-card-title { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#787878; margin-bottom:18px; display:flex; align-items:center; gap:8px; }
  .rp-card-title::before { content:''; display:inline-block; width:3px; height:13px; background:#e10a1d; border-radius:2px; }

  /* Filter bar */
  .rp-filter-bar {
    background:#fff; border:1px solid #e8e8e8; border-radius:10px; padding:18px 22px;
    display:flex; flex-wrap:wrap; align-items:flex-end; gap:14px;
  }
  .fg { display:flex; flex-direction:column; gap:6px; }
  .fl { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; }
  .fi {
    height:40px; padding:0 12px; font-family:'Barlow',sans-serif; font-size:14px;
    color:#212529; background:#f8f8f8; border:1.5px solid #e8e8e8;
    border-radius:10px; outline:none; transition:all .15s;
  }
  .fi:focus { border-color:#e10a1d; background:#fff; box-shadow:0 0 0 3px rgba(225,10,29,.1); }

  .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:9px 18px; font-family:'Barlow',sans-serif; font-size:13px; font-weight:700; letter-spacing:.5px; border-radius:10px; border:none; cursor:pointer; transition:all .15s; white-space:nowrap; }
  .btn-primary { background:#e10a1d; color:#fff; }
  .btn-primary:hover { background:#ff1a2e; transform:translateY(-1px); box-shadow:0 4px 14px rgba(225,10,29,.3); }
  .btn-secondary { background:#f8f8f8; color:#212529; border:1.5px solid #e8e8e8; }
  .btn-secondary:hover { border-color:#212529; background:#f0f0f0; }
  .btn-sm { padding:6px 14px; font-size:12px; }

  /* Report action row */
  .rp-action-row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; align-items:center; }
  .rp-total-badge {
    margin-left:auto; background:#ecfdf5; color:#059669;
    padding:6px 14px; border-radius:20px; font-size:13px; font-weight:700;
  }

  /* Table */
  .rp-table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  thead th { text-align:left; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; padding:10px 14px; border-bottom:2px solid #f0f0f0; white-space:nowrap; }
  tbody tr { border-bottom:1px solid #f8f8f8; transition:background .1s; }
  tbody tr:hover { background:#fafafa; }
  tbody td { padding:12px 14px; color:#212529; vertical-align:middle; }
  tbody tr:last-child { border-bottom:none; }

  .rp-empty { padding:40px; text-align:center; color:#787878; font-size:14px; }

  /* Report type buttons */
  .rp-type-row { display:flex; gap:10px; flex-wrap:wrap; }
  .rp-type-btn {
    flex:1; min-width:160px; padding:16px 20px;
    background:#f8f8f8; border:1.5px solid #e8e8e8; border-radius:10px;
    cursor:pointer; font-family:'Barlow',sans-serif; transition:all .15s;
    display:flex; flex-direction:column; gap:6px; align-items:flex-start;
  }
  .rp-type-btn:hover { border-color:#e10a1d; background:#fff; }
  .rp-type-btn.active { border-color:#e10a1d; background:#fff0f1; }
  .rp-type-btn .rp-type-icon { color:#e10a1d; }
  .rp-type-label { font-size:13px; font-weight:700; color:#212529; }
  .rp-type-sub { font-size:11px; color:#787878; }

  .spin { width:16px; height:16px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }
  @keyframes spin { to { transform:rotate(360deg); } }
`;

function formatCurrency(v) {
  if (!v && v !== 0) return '₹0';
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(2)} Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)} L`;
  return `₹${Number(v).toLocaleString('en-IN')}`;
}

export default function Reports() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salesReport, setSalesReport] = useState([]);
  const [incentiveReport, setIncentiveReport] = useState(null);
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingIncentive, setLoadingIncentive] = useState(false);

  const monthParam = `${month}-01`;

  const loadSales = async () => {
    setLoadingSales(true);
    try {
      const data = await api(`/reports/sales?month=${monthParam}`);
      setSalesReport(data);
    } finally {
      setLoadingSales(false);
    }
  };

  const loadIncentives = async () => {
    setLoadingIncentive(true);
    try {
      const data = await api(`/reports/incentives?month=${monthParam}`);
      setIncentiveReport(data);
    } finally {
      setLoadingIncentive(false);
    }
  };

  const exportCsv = (type) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE}/reports/export/csv?type=${type}&month=${monthParam}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${type}-report-${month}.csv`;
        a.click();
      });
  };

  return (
    <>
      <style>{css}</style>
      <div className="rp">

        <div className="rp-header"><h2>Reports</h2></div>

        {/* Filter + action bar */}
        <div className="rp-filter-bar">
          <div className="fg">
            <label className="fl">Month</label>
            <input className="fi" type="month" value={month}
              onChange={(e) => setMonth(e.target.value)} />
          </div>
          <div className="rp-type-row" style={{ flex: 1 }}>
            <button className="rp-type-btn" onClick={loadSales}>
              <BarChart2 size={20} className="rp-type-icon" />
              <span className="rp-type-label">{loadingSales ? 'Loading…' : 'Sales Report'}</span>
              <span className="rp-type-sub">Cars sold by officer</span>
            </button>
            <button className="rp-type-btn" onClick={loadIncentives}>
              <IndianRupee size={20} className="rp-type-icon" />
              <span className="rp-type-label">{loadingIncentive ? 'Loading…' : 'Incentive Report'}</span>
              <span className="rp-type-sub">Slab & payout breakdown</span>
            </button>
          </div>
        </div>

        {/* Sales report */}
        <div className="rp-card">
          <div className="rp-card-title">Monthly Sales Report</div>
          <div className="rp-action-row">
            <button className="btn btn-secondary btn-sm" onClick={() => exportCsv('sales')}>
              <Download size={14} /> Export CSV
            </button>
          </div>
          <div className="rp-table-wrap">
            {salesReport.length === 0 ? (
              <div className="rp-empty">
                <FileText size={32} style={{ color: '#dbdbdb', marginBottom: 10 }} />
                <div>Select a month and click <strong>Sales Report</strong> to load data</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Officer</th>
                    <th>Cars Sold</th>
                    <th>Incentive Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.map((r, i) => (
                    <tr key={i}>
                      <td style={{ color: '#787878', fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{r.officerName}</td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{r.carsSold}</span>
                        <span style={{ color: '#787878', fontSize: 12, marginLeft: 4 }}>cars</span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#059669' }}>{formatCurrency(r.incentiveEarned)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Incentive report */}
        {incentiveReport && (
          <div className="rp-card">
            <div className="rp-card-title">Incentive Report</div>
            <div className="rp-action-row">
              <button className="btn btn-secondary btn-sm" onClick={() => exportCsv('incentives')}>
                <Download size={14} /> Export CSV
              </button>
              <div className="rp-total-badge">
                Total Payout: {formatCurrency(incentiveReport.totalPayout)}
              </div>
            </div>
            <div className="rp-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Officer</th>
                    <th>Slab Applied</th>
                    <th>Cars</th>
                    <th>Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {(incentiveReport.rows || []).map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{r.officerName}</td>
                      <td>
                        <span style={{ background: '#fff0f1', color: '#e10a1d', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                          {r.slabApplied}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{r.carsSold}</td>
                      <td style={{ fontWeight: 700, color: '#059669' }}>{formatCurrency(r.totalPayout)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
