import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap');
  .hs { font-family:'Barlow',sans-serif; display:flex; flex-direction:column; gap:20px; }

  .hs-header { display:flex; align-items:center; gap:12px; }
  .hs-header::before { content:''; display:block; width:4px; height:26px; background:#e10a1d; border-radius:2px; }
  .hs-header h2 { font-size:22px; font-weight:800; color:#000; margin:0; }

  .hs-card { background:#fff; border:1px solid #e8e8e8; border-radius:10px; padding:22px; }
  .hs-card-title { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#787878; margin-bottom:18px; display:flex; align-items:center; gap:8px; }
  .hs-card-title::before { content:''; display:inline-block; width:3px; height:13px; background:#e10a1d; border-radius:2px; }

  .fg { display:flex; flex-direction:column; gap:6px; }
  .fl { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; }
  .fi, .fs {
    height:40px; padding:0 12px; font-family:'Barlow',sans-serif; font-size:14px;
    color:#212529; background:#f8f8f8; border:1.5px solid #e8e8e8;
    border-radius:10px; outline:none; transition:all .15s;
  }
  .fi:focus, .fs:focus { border-color:#e10a1d; background:#fff; box-shadow:0 0 0 3px rgba(225,10,29,.1); }
  .fs { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23787878' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; background-color:#f8f8f8; padding-right:36px; }

  .hs-filter-bar { display:flex; flex-wrap:wrap; gap:14px; align-items:flex-end; }

  /* Summary strip */
  .hs-summary {
    display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px;
  }
  .hs-summary-item {
    background:#f8f8f8; border-radius:10px; padding:16px 18px;
    display:flex; flex-direction:column; gap:4px;
  }
  .hs-summary-label { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; }
  .hs-summary-val { font-size:22px; font-weight:800; color:#000; }
  .hs-summary-val.red { color:#e10a1d; }

  /* Table */
  .hs-table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  thead th { text-align:left; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; padding:10px 14px; border-bottom:2px solid #f0f0f0; white-space:nowrap; }
  tbody tr { border-bottom:1px solid #f8f8f8; transition:background .1s; }
  tbody tr:hover { background:#fafafa; }
  tbody td { padding:12px 14px; color:#212529; vertical-align:middle; }
  tbody tr:last-child { border-bottom:none; }

  .hs-month-chip {
    display:inline-block; padding:4px 12px; background:#f0f0f0;
    border-radius:20px; font-size:12px; font-weight:700; color:#212529;
  }
  .hs-slab-chip {
    display:inline-block; padding:4px 12px; background:#fff0f1;
    border-radius:20px; font-size:12px; font-weight:700; color:#e10a1d;
  }
  .hs-empty { padding:40px; text-align:center; color:#787878; font-size:14px; display:flex; flex-direction:column; align-items:center; gap:10px; }
`;

function formatCurrency(v) {
  if (!v && v !== 0) return '₹0';
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(2)} Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)} L`;
  return `₹${Number(v).toLocaleString('en-IN')}`;
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (year)  params.set('year', year);
    if (month) params.set('month', `${month}-01`);
    api(`/incentives/history?${params}`).then(setHistory).catch(console.error);
  }, [year, month]);

  const slabLabel = (r) => {
    const s = r.incentive_slabs;
    if (!s) return null;
    return `${s.min_units}–${s.max_units ?? '∞'} @ ₹${s.incentive_per_car}`;
  };

  const totalCars      = history.reduce((a, r) => a + (r.total_sales || 0), 0);
  const totalIncentive = history.reduce((a, r) => a + (r.total_incentive || 0), 0);

  return (
    <>
      <style>{css}</style>
      <div className="hs">

        <div className="hs-header"><h2>Incentive History</h2></div>

        {/* Filters */}
        <div className="hs-card" style={{ padding: '18px 22px' }}>
          <div className="hs-filter-bar">
            <div className="fg">
              <label className="fl">Year</label>
              <select className="fs" value={year} onChange={(e) => setYear(e.target.value)}>
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label className="fl">Month (optional)</label>
              <input className="fi" type="month" value={month}
                onChange={(e) => setMonth(e.target.value)} />
            </div>
            {month && (
              <button
                style={{ height: 40, padding: '0 14px', background: 'none', border: '1.5px solid #e8e8e8', borderRadius: 10, cursor: 'pointer', fontSize: 12, color: '#787878', fontFamily: 'Barlow, sans-serif', fontWeight: 700 }}
                onClick={() => setMonth('')}>
                Clear Month
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        {history.length > 0 && (
          <div className="hs-summary">
            <div className="hs-summary-item">
              <div className="hs-summary-label">Months on Record</div>
              <div className="hs-summary-val">{history.length}</div>
            </div>
            <div className="hs-summary-item">
              <div className="hs-summary-label">Total Cars Sold</div>
              <div className="hs-summary-val">{totalCars}</div>
            </div>
            <div className="hs-summary-item">
              <div className="hs-summary-label">Total Earned</div>
              <div className="hs-summary-val red">{formatCurrency(totalIncentive)}</div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="hs-card">
          <div className="hs-card-title">Past Earnings</div>
          <div className="hs-table-wrap">
            {history.length === 0 ? (
              <div className="hs-empty">
                <TrendingUp size={32} style={{ color: '#dbdbdb' }} />
                <span>No history found for this period</span>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Cars Sold</th>
                    <th>Slab Applied</th>
                    <th>Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r, i) => {
                    const sl = slabLabel(r);
                    return (
                      <tr key={i}>
                        <td><span className="hs-month-chip">{r.month?.slice(0, 7)}</span></td>
                        <td style={{ fontWeight: 700, fontSize: 15 }}>{r.total_sales}</td>
                        <td>
                          {sl
                            ? <span className="hs-slab-chip">{sl}</span>
                            : <span style={{ color: '#787878' }}>N/A</span>}
                        </td>
                        <td style={{ fontWeight: 800, fontSize: 15, color: '#059669' }}>
                          {formatCurrency(r.total_incentive)}
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
